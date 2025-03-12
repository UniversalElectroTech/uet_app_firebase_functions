import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../simproApiService";
import { handleAxiosError } from "../../helper_functions/errorHandling";
import { getJobDetailsRoute, getSiteRoute } from "../config/routes";

// Returns all RCD testing progress jobs from the SimproAPI
export async function getJobSiteDetailsHandler(request: CallableRequest) {
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

		return await jobSiteDetails(simproJobId);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

export async function jobSiteDetails(simproJobId: string): Promise<any> {
	// GET
	const jobResponse = await simproApiService.get(
		getJobDetailsRoute(simproJobId)
	);

	const jobResponseData = jobResponse.data;

	const simproSiteId: string = jobResponseData["Site"]["ID"].toString();

	// GET job site information via SimproAPI
	const siteResponse = await simproApiService.get(getSiteRoute(simproSiteId));

	jobResponseData.Site = siteResponse.data;

	return jobResponseData;
}
