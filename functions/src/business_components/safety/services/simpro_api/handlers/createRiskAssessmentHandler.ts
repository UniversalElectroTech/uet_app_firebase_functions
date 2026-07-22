import { getFirestore } from "firebase-admin/firestore";
import { getSimproJob } from "../../../../../global/services/simpro_api/handlers/getJobDetailsHandler";
import { getEmployeeFromFirebase } from "../../../../../global/services/firebase_firestore_api/handlers/getEmployeeHandler";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import { getJobDetailsRoute } from "../../../../../global/services/simpro_api/config/routes";
import { getSiteDetails } from "../../../../rcd_testing/services/simpro_api/handlers/getProgressJobsFunctionHandler";
import { Job } from "../../../../rcd_testing/models/job";
import { RiskAssessmentJob } from "../../../models/riskAssessmentJob";
import { TeamMember } from "../../../models/teamMember";
import { nextRiskAssessmentId } from "./nextRiskAssessmentId";

async function fetchSimproJobAndDescription(simproId: string): Promise<{
	simproJob: Job;
	jobDescription: string;
}> {
	const jobResponse = await simproApiService.get(getJobDetailsRoute(simproId));
	const jobData: any = jobResponse.data;
	const siteId = jobData["Site"]["ID"].toString();
	const siteAddressResponse = await getSiteDetails(siteId);
	const simproJob = Job.fromSimproMap(jobData, siteAddressResponse[0]);
	const jobDescription = jobData["Description"]?.toString() ?? "";
	return { simproJob, jobDescription };
}

export async function createRiskAssessment(
	simproId: string,
	createdBy: string
): Promise<RiskAssessmentJob> {
	const db = getFirestore();

	const [simproContext, employee, riskAssessmentId] = await Promise.all([
		fetchSimproJobAndDescription(simproId),
		getEmployeeFromFirebase(createdBy),
		nextRiskAssessmentId(),
	]);

	const { simproJob, jobDescription } = simproContext;

	const supervisor = new TeamMember(employee?.name ?? "", "", true);

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

/** Kept for callers that only need the Job model. */
export async function loadSimproJob(simproId: string): Promise<Job> {
	return getSimproJob(simproId);
}
