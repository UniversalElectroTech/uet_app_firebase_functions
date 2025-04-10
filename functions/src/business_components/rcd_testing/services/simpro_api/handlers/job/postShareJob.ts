import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import admin = require("firebase-admin");
import { handleAxiosError } from "../../../../../../global/services/helper_functions/errorHandling";

import { SplitJobDetails } from "../../../../models/splitJobDetails";
import { getOrCreateRcdTestingJob } from "./getJobHandler";

export async function shareJobHandler(request: CallableRequest) {
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

		const parentJob = await getOrCreateRcdTestingJob(parentJobSimproId);
		const childJob = await getOrCreateRcdTestingJob(childJobSimproId);

		// Child Split Job Details (filled with parent job details)
		let childSplitJobDetails = SplitJobDetails.empty;
		childSplitJobDetails = childSplitJobDetails.copyWith({
			firebaseDocId: parentJob.firebaseDocId,
			simproId: parentJobSimproId,
		});

		// Parent Split Job Details (filled with child job details)
		let parentSplitJobDetails = SplitJobDetails.empty;
		parentSplitJobDetails = parentSplitJobDetails.copyWith({
			firebaseDocId: childJob.firebaseDocId,
			simproId: childJobSimproId,
		});

		// Update Parent Job
		const updatedParentJob = parentJob.copyWith({
			isSplitJob: true,
			isSplitJobParent: true,
			splitJobDetails: parentSplitJobDetails,
		});

		// Update Child Job
		const updatedChildJob = childJob.copyWith({
			isSplitJob: true,
			isSplitJobParent: false,
			splitJobDetails: childSplitJobDetails,
		});

		// Update Parent Job in firebase firestore
		const parentJobRef = admin
			.firestore()
			.collection("rcd_test_jobs")
			.doc(parentJob.firebaseDocId);
		await parentJobRef.update({
			isSplitJob: updatedParentJob.isSplitJob,
			isSplitJobParent: updatedParentJob.isSplitJobParent,
			splitJobDetails: updatedParentJob.splitJobDetails?.toFirebaseMap(),
		});

		// Update Child Job in firebase firestore
		const childJobRef = admin
			.firestore()
			.collection("rcd_test_jobs")
			.doc(childJob.firebaseDocId);
		await childJobRef.update({
			isSplitJob: updatedChildJob.isSplitJob,
			isSplitJobParent: updatedChildJob.isSplitJobParent,
			splitJobDetails: updatedChildJob.splitJobDetails?.toFirebaseMap(),
		});

		// Return updated parent job
		return updatedParentJob.toFrontEndMap();
	} catch (error) {
		return handleAxiosError(error);
	}
}
