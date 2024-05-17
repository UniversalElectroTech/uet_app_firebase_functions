import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { UserRecord } from "firebase-functions/v1/auth";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";

// returns all employees in Simpro
export async function addEmployeeToApp(request: CallableRequest) {
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

	try {
		getAuth()
			.createUser({
				email: email,
				emailVerified: false,
				phoneNumber: mobile,
				password: ".Universal@2024!",
				displayName: name,
				disabled: false,
			})
			.then((userRecord: UserRecord) => {
				getFirestore()
					.collection("app_users")
					.doc(userRecord.uid)
					.set({ simproId: simproId, securityGroup: null });
				return {
					name: name,
					email: email,
					mobile: mobile,
					simproId: simproId,
					firebaseDocId: userRecord.uid,
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
