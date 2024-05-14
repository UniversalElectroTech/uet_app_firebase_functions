import { HttpsError } from "firebase-functions/v2/https";
import axios, { AxiosResponse, AxiosError } from "axios";
import { postJobAttachmentsRoute } from "../routes";
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
		const { simproJobId, payload } = request.data;

		// Encode payload to JSON
		const jsonPayload = JSON.stringify(payload);

		// Make API post request
		const response: AxiosResponse = await simproApiService.post(
			postJobAttachmentsRoute(simproJobId),
			jsonPayload
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
			// Handle other types of errors
			throw new HttpsError("internal", "An unknown error occurred");
		}
	}
}
