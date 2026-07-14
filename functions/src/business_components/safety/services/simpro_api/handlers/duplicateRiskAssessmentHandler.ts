import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { RiskAssessmentJob } from "../../../models/riskAssessmentJob";
import { TeamMember } from "../../../models/teamMember";
import { nextRiskAssessmentId } from "./nextRiskAssessmentId";

export async function duplicateRiskAssessmentHandler(
	request: CallableRequest
) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	const { firebaseId }: { firebaseId: string } = request.data;

	if (!firebaseId) {
		throw new HttpsError("invalid-argument", "firebaseId is required.");
	}

	try {
		const duplicated = await duplicateRiskAssessment(
			firebaseId,
			request.auth.uid
		);
		return duplicated.toFrontendMap();
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function duplicateRiskAssessment(firebaseId: string, userId: string) {
	const db = getFirestore();
	const sourceRef = db.collection("risk_assessments").doc(firebaseId);
	const sourceSnap = await sourceRef.get();

	if (!sourceSnap.exists) {
		throw new HttpsError("not-found", "Risk assessment not found.");
	}

	const sourceData = sourceSnap.data() as Record<string, any>;

	if (sourceData.createdBy !== userId) {
		throw new HttpsError(
			"permission-denied",
			"You do not have permission to duplicate this risk assessment."
		);
	}

	if (sourceData.status !== "complete") {
		throw new HttpsError(
			"failed-precondition",
			"Only submitted risk assessments can be duplicated."
		);
	}

	const existingProgress = await db
		.collection("risk_assessments")
		.where("simproId", "==", sourceData.simproId)
		.where("status", "==", "progress")
		.get();

	const ownedProgress = existingProgress.docs.find(
		(doc) => doc.data()?.createdBy === userId
	);

	if (ownedProgress) {
		throw new HttpsError(
			"failed-precondition",
			"An In Progress risk assessment already exists for this job. Finish or delete it first."
		);
	}

	const sourceJob = RiskAssessmentJob.fromMap({
		...sourceData,
		firebaseId: sourceSnap.id,
	});

	const riskAssessmentId = await nextRiskAssessmentId();

	// Copy editable assessment content into a fresh In Progress draft.
	// Clear GPS, completion audit fields, and signatures so it must be re-signed.
	// Always allocate a new Risk Assessment ID — never reuse the source ID.
	const duplicatedJob = new RiskAssessmentJob(
		"",
		new Date(),
		userId,
		sourceJob.name,
		sourceJob.address,
		sourceJob.customer,
		sourceJob.simproId,
		"progress",
		sourceJob.jobDescription,
		"",
		sourceJob.completedBy,
		sourceJob.phone,
		sourceJob.email,
		sourceJob.taskActivity,
		sourceJob.understandsTask,
		sourceJob.highRiskTasks,
		sourceJob.hazards,
		sourceJob.additionalHazards,
		sourceJob.ppeSelections,
		new TeamMember(sourceJob.supervisor.name, "", true),
		sourceJob.teamMembers.map(
			(member) => new TeamMember(member.name, "", false)
		),
		"",
		undefined,
		riskAssessmentId
	);

	const reportRef = await db
		.collection("risk_assessments")
		.add(duplicatedJob.toFirebaseMap());

	return duplicatedJob.copyWith({ firebaseId: reportRef.id });
}
