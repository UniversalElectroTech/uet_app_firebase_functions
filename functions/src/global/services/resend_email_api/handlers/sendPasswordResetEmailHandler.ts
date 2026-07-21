import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { isAdmin } from "../../../firebase_functions/isAdmin";
import { appPasswordResetTemplate } from "../html_templates/appPasswordResetTemplate";
import { Resend } from "resend";
import { firebaseFunctionsService } from "../../../firebase_functions/services/firebaseFunctionsService";
import { generateRandomToken } from "../../tokenGenerator";
import { handleAxiosError } from "../../helper_functions/errorHandling";

export async function sendPasswordResetEmailHandler(request: CallableRequest) {
	try {
		if (!request.auth) {
			throw new HttpsError(
				"failed-precondition",
				"The function must be called while authenticated."
			);
		}

		const {
			email,
			name,
			simproId,
			firebaseUserId,
		}: {
			email: string;
			name: string;
			simproId: string;
			firebaseUserId: string;
		} = request.data;

		if (!email || !name || !simproId || !firebaseUserId) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		if (!(await isAdmin(request.auth.uid))) {
			throw new HttpsError(
				"failed-precondition",
				"User is not authenticated for this action."
			);
		}

		return await sendPasswordResetEmail(email, name, simproId, firebaseUserId);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function sendPasswordResetEmail(
	email: string,
	name: string,
	simproId: string,
	firebaseUserId: string
) {
	const userSnap = await getFirestore()
		.collection("app_users")
		.doc(firebaseUserId)
		.get();

	if (!userSnap.exists) {
		throw new HttpsError("failed-precondition", "User account does not exist.");
	}

	const userData = userSnap.data()!;
	if (userData.isAccountDeleted === true) {
		throw new HttpsError(
			"failed-precondition",
			"User account has been deleted."
		);
	}

	const resetTokenData = generateResetTokenData();

	await getFirestore().collection("app_password_resets").doc(simproId).set({
		name: name,
		email: email,
		simproId: simproId,
		firebaseUserId: firebaseUserId,
		resetToken: resetTokenData,
	});

	await emailPasswordReset(name, email, resetTokenData.token, simproId);

	return { success: true };
}

async function emailPasswordReset(
	name: string,
	email: string,
	token: string,
	simproId: string
) {
	const resetLink = `https://app.uet.net.au/reset-password?user=${simproId}&token=${token}`;

	const resend = new Resend(firebaseFunctionsService.resendEmailKey.value());

	try {
		console.log("Sending password reset email via Resend");
		await resend.emails.send({
			from: "Universal Electro Tech <noreply@uet.net.au>",
			to: [email],
			subject: "Reset your UET App password",
			html: appPasswordResetTemplate(name, resetLink),
		});
		console.log("Password reset email sent successfully");
	} catch (error: any) {
		console.error("Error sending password reset email", error);
		throw new Error("Failed to send password reset email");
	}
}

function generateResetTokenData() {
	const token = generateRandomToken(16);

	const expirationTime = new Date();
	expirationTime.setHours(expirationTime.getHours() + 1); // Expires in 1 hour

	return {
		token: token,
		expiration: Timestamp.fromDate(expirationTime),
	};
}
