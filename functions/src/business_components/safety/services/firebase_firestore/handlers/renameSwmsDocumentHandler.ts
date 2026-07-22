import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { serializeSwmsDocument } from "../helpers/swmsSerialize";

export async function renameSwmsDocumentHandler(request: CallableRequest) {
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
				"Admin access is required to rename SWMS documents."
			);
		}

		const documentId = String(request.data?.documentId ?? "").trim();
		const name = String(request.data?.name ?? "").trim();

		if (!documentId || !name) {
			throw new HttpsError(
				"invalid-argument",
				"documentId and name are required."
			);
		}

		const docRef = getFirestore().collection("swms_documents").doc(documentId);
		const snapshot = await docRef.get();
		if (!snapshot.exists) {
			throw new HttpsError("not-found", "SWMS document not found.");
		}

		await docRef.update({
			name,
			updatedAt: FieldValue.serverTimestamp(),
		});

		const updated = await docRef.get();
		return {
			document: serializeSwmsDocument(documentId, updated.data() ?? {}),
		};
	} catch (error) {
		return handleAxiosError(error);
	}
}
