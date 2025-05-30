import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { getFirestore } from "firebase-admin/firestore";
import { getSimproJob } from "../../../../../global/services/simpro_api/handlers/getJobDetailsHandler";
import { CctvJob } from "../../../models/cctvJob";
import { createCctvReport } from "./createCctvReportHandler";

export async function getCctvJobDetailsHandler(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const { simproId }: { simproId: string } = request.data;

		// Check if all required parameters have been received
		if (!simproId) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		const userId = request.auth.uid;

		const cctvReport = await getOrCreateCctvReportDetails(simproId, userId);

		return cctvReport;
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function getOrCreateCctvReportDetails(simproId: string, userId: string) {
	const db = getFirestore();
	const reportRef = db
		.collection("cctv_reports")
		.where("simproId", "==", simproId); // Updated to remove doc() for querying

	const reportSnapshot = await reportRef.get(); // Changed to reportSnapshot for clarity

	if (reportSnapshot.empty) {
		// Check if no reports exist
		const cctvReport = await createCctvReport(simproId, userId);
		return cctvReport;
	}

	const reportData = reportSnapshot.docs[0].data(); // Get the first document's data

	if (!reportData) {
		const cctvReport = await createCctvReport(simproId, userId);
		return cctvReport;
	}

	let cctvJob = CctvJob.fromMap(reportData);

	// GET job details by ID via SimproAPI
	const jobResponse = await getSimproJob(simproId);

	cctvJob = cctvJob.copyWith({
		name: jobResponse.name,
		address: jobResponse.getAddress(),
		simproId: simproId,
	});

	const reportDocRef = reportSnapshot.docs[0].ref; // Get the first document's data

	// Update the report with the provided updates
	await reportDocRef.update(cctvJob.toFirebaseMap());

	cctvJob.firebaseId = reportSnapshot.docs[0].id;

	return cctvJob.toFrontendMap();
}
