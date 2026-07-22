import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { RiskAssessmentJob } from "../../../models/riskAssessmentJob";

export async function updateRiskAssessmentHandler(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const { riskAssessmentJob } = request.data;

		if (!riskAssessmentJob) {
			throw new HttpsError(
				"invalid-argument",
				"riskAssessmentJob is required."
			);
		}

		return await updateRiskAssessment(riskAssessmentJob);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

export async function updateRiskAssessment(riskAssessmentJob: any) {
	const db = getFirestore();
	const reportRef = db
		.collection("risk_assessments")
		.doc(riskAssessmentJob.firebaseId);

	const existing = await reportRef.get();
	if (!existing.exists) {
		throw new HttpsError("not-found", "Risk assessment not found.");
	}

	const existingData = existing.data() as Record<string, any>;
	if (existingData.status === "complete") {
		throw new HttpsError(
			"failed-precondition",
			"Completed risk assessments are locked and cannot be edited."
		);
	}

	// Persist client payload as-is. Simpro metadata is refreshed on open/create,
	// not on every debounced autosave (that doubled latency for every keystroke).
	const updatedJob = RiskAssessmentJob.fromMap(riskAssessmentJob);
	await reportRef.update(updatedJob.toFirebaseUpdateMap());

	return { success: true };
}
