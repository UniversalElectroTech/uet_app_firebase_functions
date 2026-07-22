import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import {
	FieldValue,
	getFirestore,
	Query,
	Timestamp,
} from "firebase-admin/firestore";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import {
	defaultSwmsSettings,
	isSignatureCurrentlyValid,
} from "../helpers/swmsSerialize";

const SETTINGS_DOC_ID = "resign";

export async function invalidateSwmsSignaturesHandler(
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
				"Admin access is required to force SWMS re-sign."
			);
		}

		const reason = String(request.data?.reason ?? "").trim();
		const documentId =
			typeof request.data?.documentId === "string"
				? request.data.documentId.trim()
				: "";
		const employeeId =
			typeof request.data?.employeeId === "string"
				? request.data.employeeId.trim()
				: "";

		if (!reason) {
			throw new HttpsError("invalid-argument", "reason is required.");
		}

		const settingsSnap = await getFirestore()
			.collection("swms_settings")
			.doc(SETTINGS_DOC_ID)
			.get();
		const settingsData = settingsSnap.exists
			? settingsSnap.data()!
			: defaultSwmsSettings();
		const nextRaw = settingsData.nextReSignDate;
		const nextReSignDate =
			nextRaw instanceof Timestamp
				? nextRaw.toDate()
				: nextRaw instanceof Date
					? nextRaw
					: null;

		let query: Query = getFirestore().collection("swms_signatures");
		if (documentId) {
			query = query.where("documentId", "==", documentId);
		}
		if (employeeId) {
			query = query.where("employeeId", "==", employeeId);
		}

		const snapshot = await query.get();
		const batch = getFirestore().batch();
		let invalidatedCount = 0;

		for (const doc of snapshot.docs) {
			const data = doc.data();
			if (
				!isSignatureCurrentlyValid(data, {
					nextReSignDate,
				})
			) {
				continue;
			}

			batch.update(doc.ref, {
				invalidatedAt: FieldValue.serverTimestamp(),
				invalidatedBy: request.auth!.uid,
				invalidateReason: reason,
			});
			invalidatedCount += 1;
		}

		if (invalidatedCount > 0) {
			await batch.commit();
		}

		return { success: true, invalidatedCount };
	} catch (error) {
		return handleAxiosError(error);
	}
}
