import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { isAdmin } from "../../../firebaseFunctions/isAdmin";
import { generateRandomToken } from "../../tokenGenerator";
import { appInviteTemplate } from "../html_templates/appInviteTemplate";
import { Resend } from "resend";
import { firebaseFunctionsService } from "../../../firebaseFunctions/services/firebaseFunctionsServ";

export async function inviteEmployeeToApp(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be " + "called while authenticated."
		);
	}
	const {
		email,
		mobile,
		name,
		simproId,
	}: { email: string; mobile: string; name: string; simproId: string } =
		request.data;

	// Check if all required parameters have been received
	if (!email || !mobile || !name || !simproId) {
		throw new HttpsError(
			"failed-precondition",
			"Required parameters are missing."
		);
	}

	// Check if user is admin
	if (!(await isAdmin(request.auth.uid))) {
		throw new HttpsError(
			"failed-precondition",
			"User is not authenticated for this action."
		);
	}

	try {
		const inviteTokenData = generateInviteTokenData();

		await getFirestore().collection("app_invites").doc(simproId).set({
			name: name,
			email: email,
			mobile: mobile,
			simproId: simproId,
			inviteToken: inviteTokenData,
		});

		await emailAppInvite(name, email, inviteTokenData.token, simproId);

		return;
	} catch (error: any) {
		if (error instanceof Error) {
			// Handle standard errors
			throw new HttpsError("internal", error.message || "An error occurred");
		} else {
			throw error;
		}
	}
}

async function emailAppInvite(
	name: string,
	email: string,
	token: string,
	simproId: string
) {
	const inviteLink = `https://www.app.uet.net.au/welcome?user=${simproId}&token=${token}`;

	const resend = new Resend(firebaseFunctionsService.resendEmailKey.value());

	await resend.emails.send({
		from: "Universal Electro Tech <noreply@uet.net.au>",
		to: [email],
		subject: "Invite to UET App",
		html: appInviteTemplate(name, inviteLink),
	});
}

function generateInviteTokenData() {
	const token = generateRandomToken(16);

	const expirationTime = new Date();
	expirationTime.setHours(expirationTime.getHours() + 1); // Expires in 1 hour

	const inviteTokenData = {
		token: token,
		expiration: Timestamp.fromDate(expirationTime), // Convert expiration time to Firestore Timestamp
	};
	return inviteTokenData;
}
