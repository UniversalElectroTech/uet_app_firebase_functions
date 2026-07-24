import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { postJobAttachments } from "../../../../../global/services/simpro_api/handlers/postJobAttachmentsHandler";

/** Builds `{RA#}_{Job#}_{ddmmyy}.pdf` for Simpro job attachments. */
function buildRiskAssessmentPdfFileName({
	riskAssessmentId,
	jobNumber,
	date,
}: {
	riskAssessmentId?: string;
	jobNumber?: string;
	date: Date;
}): string {
	const safe = (value: string) => value.replace(/[\/\\]/g, ",");
	const raPart = safe(
		typeof riskAssessmentId === "string" && riskAssessmentId.trim()
			? riskAssessmentId.trim()
			: "RA"
	);
	const jobPart = safe(
		typeof jobNumber === "string" && jobNumber.trim()
			? jobNumber.trim()
			: "job"
	);
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = String(date.getFullYear() % 100).padStart(2, "0");
	return `${raPart}_${jobPart}_${day}${month}${year}.pdf`;
}

export async function completeRiskAssessmentHandler(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	const { firebaseId, pdfReport, gpsCoords, completedAt, fileName: requestedFileName } =
		request.data;

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

	// Prefer the device completion time so "Completed At" matches the user's local clock.
	// Fall back to server time for older clients that don't send completedAt.
	let completedAtValue: Date | FieldValue = FieldValue.serverTimestamp();
	if (completedAt != null) {
		const parsed =
			completedAt instanceof Date ? completedAt : new Date(completedAt);
		if (!Number.isNaN(parsed.getTime())) {
			completedAtValue = parsed;
		}
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
			completedAt: completedAtValue,
			completedByUid: request.auth.uid,
		});

		// Prefer client-provided name so ddmmyy matches the device local date.
		// Fall back to server-built `{RA#}_{Job#}_{ddmmyy}.pdf` for older clients.
		const fileName =
			typeof requestedFileName === "string" && requestedFileName.trim()
				? requestedFileName.trim().replace(/[\/\\]/g, ",")
				: buildRiskAssessmentPdfFileName({
						riskAssessmentId: reportData.riskAssessmentId,
						jobNumber: reportData.simproId,
						date:
							completedAtValue instanceof Date
								? completedAtValue
								: new Date(),
				  });

		const response = await postJobAttachments(reportData.simproId, {
			Filename: fileName,
			Base64Data: pdfReport,
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
