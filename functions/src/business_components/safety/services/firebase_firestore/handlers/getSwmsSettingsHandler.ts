import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import {
	defaultSwmsSettings,
	serializeSwmsSettings,
} from "../helpers/swmsSerialize";

const SETTINGS_DOC_ID = "resign";

export async function getSwmsSettingsHandler(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const settingsRef = getFirestore()
			.collection("swms_settings")
			.doc(SETTINGS_DOC_ID);
		const snapshot = await settingsRef.get();

		if (!snapshot.exists || !snapshot.data()) {
			const defaults = defaultSwmsSettings();
			await settingsRef.set({
				weeks: defaults.weeks,
				months: defaults.months,
				years: defaults.years,
				nextReSignDate: defaults.nextReSignDate,
				updatedAt: FieldValue.serverTimestamp(),
				updatedBy: null,
			});
			return { settings: serializeSwmsSettings(defaults) };
		}

		return { settings: serializeSwmsSettings(snapshot.data()!) };
	} catch (error) {
		return handleAxiosError(error);
	}
}
