import { HttpsError } from "firebase-functions/v2/https";
import axios, { AxiosResponse, AxiosError } from "axios";
import { patchJobStageRoute } from "../config/routes";
import { simproApiService } from "../simproApiService";

// Updates job stage
export async function patchToggleJobStage(request: any) {
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
			description,
			currentStage,
		}: { simproJobId: string; description: string; currentStage: string } =
			request.data;

		// Check if all required parameters have been received
		if (!simproJobId || !description || !currentStage) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		// Determine the stage based on the 'currentStage' argument
		const stage: string = currentStage === "Progress" ? "Complete" : "Progress";

		// Prepare payload
		const payload = {
			Stage: stage,
			Description: description,
		};

		// Make API patch request
		const response: AxiosResponse = await simproApiService.patch(
			patchJobStageRoute(simproJobId),
			payload
		);

		// Return response data
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
