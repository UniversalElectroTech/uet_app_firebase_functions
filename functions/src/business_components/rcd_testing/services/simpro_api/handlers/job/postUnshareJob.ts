import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import admin = require("firebase-admin");
import { handleAxiosError } from "../../../../../../global/services/helper_functions/errorHandling";
import { getOrCreateRcdTestingJob } from "./getJobHandler";

export async function unshareJobHandler(request: CallableRequest) {
	try {
		if (!request.auth) {
			throw new HttpsError(
				"failed-precondition",
				"The function must be called while authenticated."
			);
		}

		const {
			parentJobSimproId,
			childJobSimproId,
		}: { parentJobSimproId: string; childJobSimproId: string } = request.data;

		if (!parentJobSimproId || !childJobSimproId) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		// Update Parent Job
		const parentJobQuery = await admin
			.firestore()
			.collection("rcd_test_jobs")
			.where("simproId", "==", parentJobSimproId)
			.get();
		const parentJobRef = parentJobQuery.docs[0].ref;

		await parentJobRef.update({
			isSplitJob: false,
			isSplitJobParent: false,
			splitJobDetails: null,
		});

		// Update Child Job
		const childJobQuery = await admin
			.firestore()
			.collection("rcd_test_jobs")
			.where("simproId", "==", childJobSimproId)
			.get();
		const childJobRef = childJobQuery.docs[0].ref;

		await childJobRef.update({
			isSplitJob: false,
			isSplitJobParent: false,
			splitJobDetails: null,
		});

		// Get Updated Job details to return
		const job = await getOrCreateRcdTestingJob(parentJobSimproId);

		return job.toFrontEndMap();
	} catch (error) {
		return handleAxiosError(error);
	}
}
