import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../simproApiService";
import { getJobDetailsRoute } from "../config/routes";
import { handleAxiosError } from "../../helper_functions/errorHandling";
import { getSiteDetails } from "../../../../business_components/rcd_testing/services/simpro_api/handlers/getProgressJobsFunctionHandler";
import { Job } from "../../../../business_components/rcd_testing/models/job";

// Returns the details of a job from the SimproAPI
export async function getJobDetailsHandler(request: CallableRequest) {
	try {
		// Check that the user is authenticated.
		if (!request.auth) {
			// Throwing an HttpsError so that the client gets the error details.
			throw new HttpsError(
				"failed-precondition",
				"The function must be called while authenticated."
			);
		}

		// Extract and validate data from the client
		const {
			simproJobId,
		}: {
			simproJobId: string;
		} = request.data;

		// Check if all required parameters have been received
		if (!simproJobId) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		return await getSimproJob(simproJobId);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

export async function getSimproJob(simproJobId: string): Promise<Job> {
	// GET job details via SimproAPI
	const jobResponse = await simproApiService.get(
		getJobDetailsRoute(simproJobId)
	);

	const jobData: any = jobResponse.data;

	// Extract site IDs
	const siteId = jobData["Site"]["ID"].toString();

	// Fetch site address
	const siteAddressResponse = await getSiteDetails(siteId);
	const siteAddressMap: any = siteAddressResponse[0];

	const simproJob = Job.fromSimproMap(jobData, siteAddressMap);

	return simproJob;
}
