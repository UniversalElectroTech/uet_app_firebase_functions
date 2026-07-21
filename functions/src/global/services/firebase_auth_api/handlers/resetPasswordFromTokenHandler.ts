import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { isTokenValid } from "../../helper_functions/isTokenValid";
import { handleAxiosError } from "../../helper_functions/errorHandling";

export async function resetPasswordFromTokenHandler(request: CallableRequest) {
	try {
		const {
			simproId,
			token,
			password,
		}: { simproId: string; token: string; password: string } = request.data;

		if (!simproId || !token || !password) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		return await resetPasswordFromToken(simproId, token, password);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function resetPasswordFromToken(
	simproId: string,
	token: string,
	password: string
) {
	const resetSnap = await getFirestore()
		.collection("app_password_resets")
		.doc(simproId)
		.get();

	if (!resetSnap.exists) {
		throw new HttpsError(
			"failed-precondition",
			"Password reset request is missing or has already been used."
		);
	}

	const resetData = resetSnap.data()!;

	if (resetData.resetToken.token != token) {
		throw new HttpsError("failed-precondition", "Invalid token.");
	}

	if (!isTokenValid(resetData.resetToken.expiration)) {
		throw new HttpsError("failed-precondition", "Token has expired.");
	}

	const firebaseUserId = resetData.firebaseUserId as string;

	// Delete reset doc before updating password so the link cannot be reused
	await getFirestore().collection("app_password_resets").doc(simproId).delete();

	await getAuth().updateUser(firebaseUserId, {
		password: password,
	});

	return { success: true };
}
