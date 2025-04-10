import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import admin = require("firebase-admin");
import { handleAxiosError } from "../../../../../../global/services/helper_functions/errorHandling";
import { Job } from "../../../../models/job";
import { getSimproJob } from "../../../../../../global/services/simpro_api/handlers/getJobDetailsHandler";

export async function getJobHandler(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	const { simproJobId } = request.data;

	if (!simproJobId) {
		throw new HttpsError(
			"failed-precondition",
			"Required parameters are missing."
		);
	}

	try {
		// Attempt to get the job
		const job = await getOrCreateRcdTestingJob(simproJobId);
		const jobMap = job.toFrontEndMap();
		return jobMap;
	} catch (error) {
		return handleAxiosError(error);
	}
}

export async function getOrCreateRcdTestingJob(
	simproJobId: string
): Promise<Job> {
	const firebaseJob = await getOrCreateFirebaseJob(simproJobId);

	const simproJob = await getSimproJob(simproJobId);

	const rcdTestingJob = simproJob.addFromFirebaseMap(firebaseJob);

	return rcdTestingJob;
}

export async function getOrCreateFirebaseJob(
	simproJobId: string
): Promise<Job> {
	let firebaseJob: Job | null = null;

	const jobSnapshot = await admin
		.firestore()
		.collection("rcd_test_jobs")
		.where("simproId", "==", simproJobId)
		.get();

	// Get or create firebase job
	if (!jobSnapshot.empty) {
		// Job exists, return it
		let firebaseJobData = jobSnapshot.docs[0].data();
		firebaseJobData.firebaseDocId = jobSnapshot.docs[0].id;
		firebaseJob = Job.fromFirebaseMap(firebaseJobData);
	} else {
		// Job does not exist, create it
		firebaseJob = await createFirebaseJob(simproJobId);
	}

	return firebaseJob;
}

async function createFirebaseJob(simproJobId: string): Promise<Job> {
	try {
		let job = Job.empty();

		job = job.copyWith({ simproId: simproJobId });

		// Create a blank document with the specified structure
		const jobDocRef = await admin
			.firestore()
			.collection("rcd_test_jobs")
			.add(job.toFirebaseMap());

		await createFirstDistributionBoard(jobDocRef.id);

		// Add firebasedocid to jobData
		job = job.copyWith({ firebaseDocId: jobDocRef.id });

		return job;
	} catch (e) {
		throw new Error(`Error creating job: ${e}`);
	}

	async function createFirstDistributionBoard(jobDocId: string) {
		const newDb = {
			firebaseDocId: "",
			notes: "",
			rcds: [],
			images: [],
			orderId: 1,
			name: "DB 1",
		};

		const jobDocRef = admin
			.firestore()
			.collection("rcd_test_jobs")
			.doc(jobDocId);
		const dbDocRef = jobDocRef.collection("distribution_boards").doc();
		await dbDocRef.set(newDb);
		return dbDocRef.id;
	}
}
