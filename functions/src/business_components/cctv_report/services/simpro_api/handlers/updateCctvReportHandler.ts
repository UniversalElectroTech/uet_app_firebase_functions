import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { getSimproJob } from "../../../../../global/services/simpro_api/handlers/getJobDetailsHandler";
import { CctvJob } from "../../../models/cctvJob";

export async function updateCctvReportHandler(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const { cctvJob } = request.data;

		if (!cctvJob) {
			throw new HttpsError(
				"invalid-argument",
				"firebaseId and updates are required."
			);
		}

		const cctvReport = await updateCctvReport(cctvJob);

		return cctvReport;
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

export async function updateCctvReport(cctvJob: any) {
	let updatedCctvJob = CctvJob.fromMap(cctvJob);

	const simproJob = await getSimproJob(cctvJob.simproId);

	updatedCctvJob = updatedCctvJob.copyWith({
		name: simproJob.name,
		address: simproJob.getAddress(),
	});

	const db = getFirestore();
	const reportRef = db.collection("cctv_reports").doc(cctvJob.firebaseId);

	// Update the report with the provided updates
	await reportRef.update(updatedCctvJob.toFirebaseUpdateMap());

	return updatedCctvJob;
}
