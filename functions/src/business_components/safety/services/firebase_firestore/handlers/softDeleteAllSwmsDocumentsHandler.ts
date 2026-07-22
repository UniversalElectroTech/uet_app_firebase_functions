import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";

export async function softDeleteAllSwmsDocumentsHandler(
	request: CallableRequest
) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		if (!(await isAdmin(request.auth.uid))) {
			throw new HttpsError(
				"permission-denied",
				"Admin access is required to delete SWMS documents."
			);
		}

		const snapshot = await getFirestore()
			.collection("swms_documents")
			.where("status", "==", "active")
			.get();

		const batch = getFirestore().batch();
		for (const doc of snapshot.docs) {
			batch.update(doc.ref, {
				status: "deleted",
				updatedAt: FieldValue.serverTimestamp(),
			});
		}
		await batch.commit();

		return { success: true, deletedCount: snapshot.size };
	} catch (error) {
		return handleAxiosError(error);
	}
}
