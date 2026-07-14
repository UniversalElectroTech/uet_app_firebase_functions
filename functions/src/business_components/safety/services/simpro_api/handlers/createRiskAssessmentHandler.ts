import { getFirestore } from "firebase-admin/firestore";
import { getSimproJob } from "../../../../../global/services/simpro_api/handlers/getJobDetailsHandler";
import { getEmployeeFromFirebase } from "../../../../../global/services/firebase_firestore_api/handlers/getEmployeeHandler";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import { getJobDetailsRoute } from "../../../../../global/services/simpro_api/config/routes";
import { RiskAssessmentJob } from "../../../models/riskAssessmentJob";
import { TeamMember } from "../../../models/teamMember";
import { nextRiskAssessmentId } from "./nextRiskAssessmentId";

export async function createRiskAssessment(
	simproId: string,
	createdBy: string
): Promise<RiskAssessmentJob> {
	const db = getFirestore();
	const simproJob = await getSimproJob(simproId);
	const employee = await getEmployeeFromFirebase(createdBy);
	const riskAssessmentId = await nextRiskAssessmentId();

	let jobDescription = "";
	try {
		const jobResponse = await simproApiService.get(getJobDetailsRoute(simproId));
		jobDescription = jobResponse.data["Description"]?.toString() ?? "";
	} catch {
		jobDescription = "";
	}

	const supervisor = new TeamMember(
		employee?.name ?? "",
		"",
		true
	);

	let newRiskAssessmentJob = new RiskAssessmentJob(
		"",
		new Date(),
		createdBy,
		simproJob.name,
		simproJob.getAddress(),
		simproJob.customer,
		simproId,
		"progress",
		jobDescription,
		"",
		employee?.name ?? "",
		employee?.mobile ?? "",
		employee?.email ?? "",
		"",
		null,
		RiskAssessmentJob.defaultHighRiskTasks(),
		RiskAssessmentJob.defaultHazards(),
		[],
		RiskAssessmentJob.defaultPpeItems(),
		supervisor,
		[],
		"",
		undefined,
		riskAssessmentId
	);

	const reportRef = await db
		.collection("risk_assessments")
		.add(newRiskAssessmentJob.toFirebaseMap());

	newRiskAssessmentJob = newRiskAssessmentJob.copyWith({
		firebaseId: reportRef.id,
	});

	return newRiskAssessmentJob;
}
