import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";

export async function softDeleteSwmsDocumentHandler(request: CallableRequest) {
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

		const documentId = String(request.data?.documentId ?? "").trim();
		if (!documentId) {
			throw new HttpsError("invalid-argument", "documentId is required.");
		}

		const docRef = getFirestore().collection("swms_documents").doc(documentId);
		const snapshot = await docRef.get();
		if (!snapshot.exists) {
			throw new HttpsError("not-found", "SWMS document not found.");
		}

		await docRef.update({
			status: "deleted",
			updatedAt: FieldValue.serverTimestamp(),
		});

		return { success: true };
	} catch (error) {
		return handleAxiosError(error);
	}
}
