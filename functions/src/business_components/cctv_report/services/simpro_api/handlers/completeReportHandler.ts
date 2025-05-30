import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { postJobAttachments } from "../../../../../global/services/simpro_api/handlers/postJobAttachmentsHandler";
import { CctvReport } from "../../../models/cctvReport";

export async function completeReportHandler(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	const { firebaseId, pdfReport } = request.data;

	// Check if all required parameters have been received
	if (!firebaseId || !pdfReport) {
		throw new HttpsError(
			"invalid-argument",
			"firebaseId and pdfReport are required."
		);
	}

	try {
		const db = getFirestore();
		const reportRef = db.collection("cctv_reports").doc(firebaseId);

		const reportSnap = await reportRef.get();

		if (!reportSnap.exists) {
			throw new HttpsError("not-found", "CCTV report not found.");
		}

		const reportData = reportSnap.data() as CctvReport;

		// Update the report status to "Complete"
		await reportRef.update({
			status: "complete",
		});

		const fileName = `${reportData.name.replace(
			/[\/\\]/g,
			","
		)} - CCTV Install Details.pdf`;

		// Upload the PDF attachment to Simpro
		const response = await postJobAttachments(reportData.simproId, {
			Filename: fileName,
			Base64Data: pdfReport,
			Email: true,
			Public: true,
		});

		return {
			filename: fileName,
			success: true,
			message: "CCTV report marked as complete and PDF uploaded successfully.",
			response,
		};
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
