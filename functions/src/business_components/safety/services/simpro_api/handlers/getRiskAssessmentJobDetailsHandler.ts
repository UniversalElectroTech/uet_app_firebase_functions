import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import {
	DocumentReference,
	getFirestore,
} from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";
import { getSimproJob } from "../../../../../global/services/simpro_api/handlers/getJobDetailsHandler";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import { getJobDetailsRoute } from "../../../../../global/services/simpro_api/config/routes";
import { RiskAssessmentJob } from "../../../models/riskAssessmentJob";
import { createRiskAssessment } from "./createRiskAssessmentHandler";
import { nextRiskAssessmentId } from "./nextRiskAssessmentId";

export async function getRiskAssessmentJobDetailsHandler(
	request: CallableRequest
) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const { simproId, firebaseId }: { simproId?: string; firebaseId?: string } =
			request.data;

		if (!simproId && !firebaseId) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		const userId = request.auth.uid;

		if (firebaseId) {
			return await getRiskAssessmentById(firebaseId, userId);
		}

		const riskAssessment = await getOrCreateRiskAssessmentDetails(
			simproId!,
			userId
		);

		return riskAssessment;
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function ensureRiskAssessmentId(
	reportRef: DocumentReference,
	reportData: Record<string, any>
): Promise<string> {
	const existing = reportData.riskAssessmentId?.toString()?.trim();
	if (existing) return existing;

	const riskAssessmentId = await nextRiskAssessmentId();
	await reportRef.update({ riskAssessmentId });
	return riskAssessmentId;
}

async function getRiskAssessmentById(firebaseId: string, userId: string) {
	const db = getFirestore();
	const reportRef = db.collection("risk_assessments").doc(firebaseId);
	const reportSnap = await reportRef.get();

	if (!reportSnap.exists) {
		throw new HttpsError("not-found", "Risk assessment not found.");
	}

	const reportData = reportSnap.data() as Record<string, any>;
	if (
		reportData.createdBy !== userId &&
		!(await isAdmin(userId))
	) {
		throw new HttpsError(
			"permission-denied",
			"You do not have permission to open this risk assessment."
		);
	}

	const riskAssessmentId = await ensureRiskAssessmentId(reportRef, reportData);

	const riskAssessmentJob = RiskAssessmentJob.fromMap({
		...reportData,
		firebaseId: reportSnap.id,
		riskAssessmentId,
	});

	if (reportData.status === "complete") {
		return riskAssessmentJob.toFrontendMap();
	}

	const simproId = riskAssessmentJob.simproId;
	const jobResponse = await getSimproJob(simproId);

	let jobDescription = riskAssessmentJob.jobDescription;
	if (!jobDescription) {
		try {
			const simproResponse = await simproApiService.get(
				getJobDetailsRoute(simproId)
			);
			jobDescription = simproResponse.data["Description"]?.toString() ?? "";
		} catch {
			jobDescription = "";
		}
	}

	const updatedJob = riskAssessmentJob.copyWith({
		name: jobResponse.name,
		address: jobResponse.getAddress(),
		customer: jobResponse.customer,
		simproId,
		jobDescription,
		firebaseId: reportSnap.id,
	});

	await reportRef.update(updatedJob.toFirebaseUpdateMap());

	return updatedJob.toFrontendMap();
}

async function getOrCreateRiskAssessmentDetails(
	simproId: string,
	userId: string
) {
	const db = getFirestore();
	const reportSnapshot = await db
		.collection("risk_assessments")
		.where("simproId", "==", simproId)
		.where("createdBy", "==", userId)
		.get();

	// Prefer resuming an In Progress draft for this job.
	const progressDoc = reportSnapshot.docs.find(
		(doc) => doc.data()?.status === "progress"
	);

	if (!progressDoc) {
		// No draft — always start a new assessment (even if submitted ones exist).
		const created = await createRiskAssessment(simproId, userId);
		return created.toFrontendMap();
	}

	const reportData = progressDoc.data();
	if (!reportData) {
		const created = await createRiskAssessment(simproId, userId);
		return created.toFrontendMap();
	}

	const riskAssessmentId = await ensureRiskAssessmentId(
		progressDoc.ref,
		reportData
	);

	let riskAssessmentJob = RiskAssessmentJob.fromMap({
		...reportData,
		firebaseId: progressDoc.id,
		riskAssessmentId,
	});

	const jobResponse = await getSimproJob(simproId);

	let jobDescription = riskAssessmentJob.jobDescription;
	if (!jobDescription) {
		try {
			const simproResponse = await simproApiService.get(
				getJobDetailsRoute(simproId)
			);
			jobDescription = simproResponse.data["Description"]?.toString() ?? "";
		} catch {
			jobDescription = "";
		}
	}

	riskAssessmentJob = riskAssessmentJob.copyWith({
		name: jobResponse.name,
		address: jobResponse.getAddress(),
		customer: jobResponse.customer,
		simproId,
		jobDescription,
	});

	await progressDoc.ref.update(riskAssessmentJob.toFirebaseUpdateMap());

	riskAssessmentJob = riskAssessmentJob.copyWith({
		firebaseId: progressDoc.id,
	});

	return riskAssessmentJob.toFrontendMap();
}

