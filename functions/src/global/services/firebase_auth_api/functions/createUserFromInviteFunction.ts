import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { UserRecord } from "firebase-functions/v1/auth";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { isTokenValid } from "../../isTokenValid";

// returns all employees in Simpro
export async function createUserFromInvite(request: CallableRequest) {
	const {
		simproId,
		token,
		password,
	}: { simproId: string; token: string; password: string } = request.data;

	// Check if all required parameters have been received
	if (!simproId || !token || !password) {
		throw new HttpsError(
			"failed-precondition",
			"Required parameters are missing."
		);
	}

	try {
		const userSnap = await getFirestore()
			.collection("app_invites")
			.doc(simproId)
			.get();

		if (!userSnap.exists) {
			throw new HttpsError("failed-precondition", "User document is missing.");
		}

		const userData = userSnap.data()!;

		if (userData.inviteToken.token != token) {
			throw new HttpsError("failed-precondition", "Invalid token.");
		}

		if (!isTokenValid(userData.inviteToken.expiration)) {
			throw new HttpsError("failed-precondition", "Token has expired.");
		}

		getAuth()
			.createUser({
				email: userData.email,
				emailVerified: true,
				phoneNumber: userData.mobile,
				password: password,
				displayName: userData.name,
				disabled: false,
			})
			.then(async (userRecord: UserRecord) => {
				const querySnapshot = await getFirestore()
					.collection("app_users")
					.where("simproId", "==", simproId)
					.where("isAccountDeleted", "==", false)
					.get();

				var docId: string;
				if (querySnapshot.empty) {
					docId = userRecord.uid;
				} else {
					docId = querySnapshot.docs[0].id;
				}

				// Create user doc
				await getFirestore().collection("app_users").doc(docId).set({
					name: userData.name,
					phoneNumber: userData.mobile,
					email: userData.email,
					simproId: simproId,
					securityGroup: null,
					isAccountDeleted: false,
				});

				// Delete invite Doc
				await getFirestore().collection("app_invites").doc(simproId).delete();

				return {
					email: userData.email,
				};
			});
	} catch (error: any) {
		if (error instanceof Error) {
			// Handle standard errors
			throw new HttpsError("internal", error.message || "An error occurred");
		} else {
			throw error;
		}
	}
}
