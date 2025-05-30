// src/business_components/cctv_report/services/simpro_api/handlers/deleteCctvReportHandler.ts
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";

export async function deleteCctvReportHandler(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	const { firebaseId }: { firebaseId: string } = request.data;

	// Check if all required parameters have been received
	if (!firebaseId) {
		throw new HttpsError(
			"failed-precondition",
			"Required parameters are missing."
		);
	}

	try {
		await deleteCctvReport(firebaseId, request.auth.uid);

		return { success: true, message: "CCTV report deleted successfully." };
	} catch (error) {
		return handleAxiosError(error);
	}
}

async function deleteCctvReport(firebaseId: string, userId: string) {
	const db = getFirestore();
	const reportRef = db.collection("cctv_reports").doc(firebaseId);
	const reportDoc = await reportRef.get();

	// Check if the document exists and if the userId matches
	if (!reportDoc.exists || reportDoc.data()?.createdBy !== userId) {
		throw new HttpsError(
			"permission-denied",
			"You do not have permission to delete this report."
		);
	}

	await reportRef.delete();
}
