import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import { getCctvReportJobsRoute } from "../config/routes";

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
		const { userSimproId }: { userSimproId: string } = request.data;

		// Check if all required parameters have been received
		if (!userSimproId) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		return getCctvJobDetails(userSimproId);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function getCctvJobDetails(userSimproId: string) {
	// GET job details by ID via SimproAPI
	const jobResponse = await simproApiService.get(
		getCctvReportJobsRoute(userSimproId)
	);

	const responseData: any[] = jobResponse.data;

	return responseData;
}
