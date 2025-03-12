import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../simproApiService";
import { getJobDetailsRoute } from "../config/routes";
import { handleAxiosError } from "../../helper_functions/errorHandling";

// Returns all RCD testing progress jobs from the SimproAPI
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

		return await getJobDetails(simproJobId);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

export async function getJobDetails(simproJobId: string) {
	// GET
	const jobResponse = await simproApiService.get(
		getJobDetailsRoute(simproJobId)
	);

	const jobResponseData = jobResponse.data;

	return jobResponseData;
}
