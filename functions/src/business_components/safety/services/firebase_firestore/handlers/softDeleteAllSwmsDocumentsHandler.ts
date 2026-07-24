import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";

const FIRESTORE_BATCH_LIMIT = 500;

/** Legacy docs may omit status — treat missing as active (same as serialize). */
function isEffectivelyActive(status: unknown): boolean {
	if (status == null || status === "") return true;
	return status === "active";
}

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

		// Do not query status=="active" only — that misses legacy docs with no status field.
		const snapshot = await getFirestore().collection("swms_documents").get();
		const toDelete = snapshot.docs.filter((doc) =>
			isEffectivelyActive(doc.data()?.status)
		);

		const db = getFirestore();
		let deletedCount = 0;
		for (let i = 0; i < toDelete.length; i += FIRESTORE_BATCH_LIMIT) {
			const chunk = toDelete.slice(i, i + FIRESTORE_BATCH_LIMIT);
			const batch = db.batch();
			for (const doc of chunk) {
				batch.update(doc.ref, {
					status: "deleted",
					updatedAt: FieldValue.serverTimestamp(),
				});
			}
			await batch.commit();
			deletedCount += chunk.length;
		}

		return { success: true, deletedCount };
	} catch (error) {
		return handleAxiosError(error);
	}
}
