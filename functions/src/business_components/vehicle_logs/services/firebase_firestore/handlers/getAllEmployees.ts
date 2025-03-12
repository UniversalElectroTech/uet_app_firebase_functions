import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";

export async function getAllEmployeesHandler(request: CallableRequest) {
	try {
		// Check that the user is authenticated.
		if (!request.auth) {
			throw new HttpsError(
				"failed-precondition",
				"The function must be called while authenticated."
			);
		}

		return await getAllEmployees();
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function getAllEmployees() {
	const docSnap = await getFirestore().collection("app_users").get();

	return docSnap.docs
		.filter(
			(doc) =>
				doc.data().isAccountDeleted === undefined ||
				!doc.data().isAccountDeleted
		)
		.map((doc) => ({ docId: doc.id, name: doc.data().name }));
}
