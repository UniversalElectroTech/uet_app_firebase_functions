import { HttpsError } from "firebase-functions/v2/https";
import axios, { AxiosResponse, AxiosError } from "axios";
import { postJobAttachmentsRoute } from "../config/routes";
import { simproApiService } from "../simproApiService";

// adds attachments to job
export async function postJobAttachments(request: any) {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be " + "called while authenticated."
		);
	}
	try {
		const {
			simproJobId,
			payload,
		}: { simproJobId: string; payload: Map<string, any> } = request.data;

		// Check if all required parameters have been received
		if (!simproJobId || !payload) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		// Make API post request
		const response: AxiosResponse = await simproApiService.post(
			postJobAttachmentsRoute(simproJobId),
			payload
		);

		return response.data;
	} catch (error: any) {
		if (error instanceof Error) {
			// Handle standard errors
			throw new HttpsError("internal", error.message || "An error occurred");
		} else if (axios.isAxiosError(error)) {
			// Handle Axios errors
			const axiosError = error as AxiosError<{ errorMessage?: string }>;
			const serverErrorMessage = axiosError.response?.data?.errorMessage;
			const errorMessage =
				serverErrorMessage || axiosError.message || "An error occurred";
			throw new HttpsError("internal", errorMessage);
		} else {
			throw error;
		}
	}
}
