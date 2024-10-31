import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { postJobAttachmentsRoute } from "../config/routes";
import { simproApiService } from "../simproApiService";
import { handleAxiosError } from "../../helper_functions/errorHandling";
import { AxiosResponse } from "axios";

// adds attachments to job
export async function postJobAttachments(request: CallableRequest) {
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
		return handleAxiosError(error);
	}
}
