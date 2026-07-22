import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { serializeSwmsSettings } from "../helpers/swmsSerialize";

const SETTINGS_DOC_ID = "resign";

export async function saveSwmsSettingsHandler(request: CallableRequest) {
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
				"Admin access is required to save SWMS settings."
			);
		}

		const weeks = Number(request.data?.weeks ?? 0);
		const months = Number(request.data?.months ?? 0);
		const years = Number(request.data?.years ?? 0);
		const nextReSignDateRaw = request.data?.nextReSignDate;

		let nextReSignDate: Date | null = null;
		if (nextReSignDateRaw) {
			const parsed = new Date(nextReSignDateRaw);
			if (Number.isNaN(parsed.getTime())) {
				throw new HttpsError(
					"invalid-argument",
					"nextReSignDate must be a valid date."
				);
			}
			nextReSignDate = parsed;
		}

		const settingsRef = getFirestore()
			.collection("swms_settings")
			.doc(SETTINGS_DOC_ID);

		await settingsRef.set(
			{
				weeks,
				months,
				years,
				nextReSignDate,
				updatedAt: FieldValue.serverTimestamp(),
				updatedBy: request.auth.uid,
			},
			{ merge: true }
		);

		const snapshot = await settingsRef.get();
		return { settings: serializeSwmsSettings(snapshot.data() ?? {}) };
	} catch (error) {
		return handleAxiosError(error);
	}
}
