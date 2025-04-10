import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../../global/services/helper_functions/errorHandling";
import { Job } from "../../../../models/job";

export async function updateJobHandler(request: CallableRequest) {
	try {
		// Check that the user is authenticated.
		if (!request.auth) {
			throw new HttpsError(
				"failed-precondition",
				"The function must be called while authenticated."
			);
		}

		const { job }: { job: Job } = request.data;

		// Check if all required parameters have been received
		if (!job) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		await updateJob(job);

		return { success: true };
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

export async function updateJob(job: Job) {
	await getFirestore()
		.collection("rcd_test_jobs")
		.doc(job.firebaseDocId)
		.update(job.toFirebaseMap());
}
