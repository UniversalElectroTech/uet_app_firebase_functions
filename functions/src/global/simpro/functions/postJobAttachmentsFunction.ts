import {
	onCall,
	HttpsError,
	CallableRequest,
} from "firebase-functions/v2/https";
import axios, { AxiosResponse, AxiosError } from "axios";
import { postJobAttachmentsRoute } from "../routes";

exports.postJobAttachments = onCall(async (request: CallableRequest) => {
	try {
		const { simproJobId, payload } = request.data;

		// Encode payload to JSON
		const jsonPayload = JSON.stringify(payload);

		// Make API post request
		const response: AxiosResponse = await axios.post(
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
});
