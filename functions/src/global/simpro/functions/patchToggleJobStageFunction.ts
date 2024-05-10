import {
	onCall,
	HttpsError,
	CallableRequest,
} from "firebase-functions/v2/https";
import axios, { AxiosResponse, AxiosError } from "axios";
import { patchJobStageRoute } from "../routes";

exports.patchToggleJobStage = onCall(async (request: CallableRequest) => {
	try {
		const { simproJobId, description, currentStage } = request.data;

		// Determine the stage based on the 'currentStage' argument
		const stage: string = currentStage === "Progress" ? "Complete" : "Progress";

		// Prepare payload
		const payload = {
			Stage: stage,
			Description: description,
		};

		// Make API patch request
		const response: AxiosResponse = await axios.patch(
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
			// Handle other types of errors
			throw new HttpsError("internal", "An unknown error occurred");
		}
	}
});
