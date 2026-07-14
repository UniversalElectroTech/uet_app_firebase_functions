import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { postJobAttachments } from "../../../../../global/services/simpro_api/handlers/postJobAttachmentsHandler";

export async function completeRiskAssessmentHandler(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	const { firebaseId, pdfReport, gpsCoords } = request.data;

	if (!firebaseId || !pdfReport) {
		throw new HttpsError(
			"invalid-argument",
			"firebaseId and pdfReport are required."
		);
	}

	if (!gpsCoords || typeof gpsCoords !== "string" || !gpsCoords.trim()) {
		throw new HttpsError(
			"failed-precondition",
			"GPS coordinates are required to complete a risk assessment."
		);
	}

	try {
		const db = getFirestore();
		const reportRef = db.collection("risk_assessments").doc(firebaseId);
		const reportSnap = await reportRef.get();

		if (!reportSnap.exists) {
			throw new HttpsError("not-found", "Risk assessment not found.");
		}

		const reportData = reportSnap.data() as Record<string, any>;

		if (reportData.status === "complete") {
			throw new HttpsError(
				"failed-precondition",
				"This risk assessment is already complete and cannot be changed."
			);
		}

		await reportRef.update({
			status: "complete",
			gpsCoords: gpsCoords.trim(),
			completedAt: FieldValue.serverTimestamp(),
			completedByUid: request.auth.uid,
		});

		const fileName = `${reportData.name.replace(
			/[\/\\]/g,
			","
		)} - Risk Assessment.pdf`;

		const response = await postJobAttachments(reportData.simproId, {
			Filename: fileName,
			Base64Data: pdfReport,
			Email: true,
			Public: true,
		});

		return {
			filename: fileName,
			success: true,
			message:
				"Risk assessment marked as complete and PDF uploaded successfully.",
			response,
		};
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
