import axios, { AxiosError } from "axios";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import { getCctvReportJobsRoute } from "../config/routes";

export async function getCctvJobDetails(request: CallableRequest) {
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

		// GET job details by ID via SimproAPI
		const jobResponse = await simproApiService.get(
			getCctvReportJobsRoute(userSimproId)
		);

		const responseData: any[] = jobResponse.data;

		return responseData;
	} catch (error: any) {
		if (axios.isAxiosError(error)) {
			// Handle Axios errors
			const axiosError = error as AxiosError<{
				errors: Array<{ message: string }>;
			}>;
			const serverErrorMessage = axiosError.response?.data?.errors[0]?.message;
			const errorMessage =
				serverErrorMessage || axiosError.message || "An error occurred";
			throw new HttpsError("internal", errorMessage);
		} else if (error instanceof Error) {
			// Handle standard errors
			throw new HttpsError("internal", error.message || "An error occurred");
		} else {
			throw error;
		}
	}
}
