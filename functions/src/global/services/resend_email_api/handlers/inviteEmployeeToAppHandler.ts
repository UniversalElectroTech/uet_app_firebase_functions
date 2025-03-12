import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { isAdmin } from "../../../firebase_functions/isAdmin";
import { appInviteTemplate } from "../html_templates/appInviteTemplate";
import { Resend } from "resend";
import { firebaseFunctionsService } from "../../../firebase_functions/services/firebaseFunctionsService";
import { getAuth } from "firebase-admin/auth";
import { generateRandomToken } from "../../tokenGenerator";
import { handleAxiosError } from "../../helper_functions/errorHandling";

export async function inviteEmployeeToAppHandler(request: CallableRequest) {
	try {
		// Check that the user is authenticated.
		if (!request.auth) {
			throw new HttpsError(
				"failed-precondition",
				"The function must be called while authenticated."
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

		return await inviteEmployeeToApp(email, mobile, name, simproId);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function inviteEmployeeToApp(
	email: string,
	mobile: string,
	name: string,
	simproId: string
) {
	const querySnapshot = await getFirestore()
		.collection("app_users")
		.where("simproId", "==", simproId)
		.get();

	// If user document previously created, re-enable account.
	if (!querySnapshot.empty) {
		const doc = querySnapshot.docs[0];

		// Enable Firebase Auth user
		const docId = doc.id;
		await getAuth().updateUser(docId, {
			disabled: false,
		});

		// Update the isAccountDeleted field to false
		await getFirestore()
			.collection("app_users")
			.doc(docId)
			.update({ isAccountDeleted: false });

		return { alreadyHasAccount: true, firebaseId: docId };
	}

	const inviteTokenData = generateInviteTokenData();

	await getFirestore().collection("app_invites").doc(simproId).set({
		name: name,
		email: email,
		mobile: mobile,
		simproId: simproId,
		inviteToken: inviteTokenData,
	});

	await emailAppInvite(name, email, inviteTokenData.token, simproId);

	return { alreadyHasAccount: false, firebaseId: null };
}

async function emailAppInvite(
	name: string,
	email: string,
	token: string,
	simproId: string
) {
	const inviteLink = `https://app.uet.net.au/welcome?user=${simproId}&token=${token}`;

	const resend = new Resend(firebaseFunctionsService.resendEmailKey.value());

	try {
		console.log("Sending email invite via Resend");
		await resend.emails.send({
			from: "Universal Electro Tech <noreply@uet.net.au>",
			to: [email],
			subject: "Invite to UET App",
			html: appInviteTemplate(name, inviteLink),
		});
		console.log("Email invite sent successfully");
	} catch (error: any) {
		console.error("Error sending email invite", error);
		throw new Error("Failed to send email invite");
	}
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
