import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import {
	postJobAttachmentsRoute,
	postMultipleJobAttachmentsRoute,
} from "../config/routes";
import { simproApiService } from "../simproApiService";
import { handleAxiosError } from "../../helper_functions/errorHandling";
import { AxiosResponse } from "axios";

// adds attachments to job
export async function postJobAttachmentsHandler(request: CallableRequest) {
	try {
		// Check that the user is authenticated.
		if (!request.auth) {
			// Throwing an HttpsError so that the client gets the error details.
			throw new HttpsError(
				"failed-precondition",
				"The function must be " + "called while authenticated."
			);
		}

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
		return await postJobAttachments(simproJobId, payload);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

export async function postJobAttachments(simproJobId: string, payload: any) {
	// Make API post request
	const response: AxiosResponse = await simproApiService.post(
		postJobAttachmentsRoute(simproJobId),
		payload
	);

	return response.data;
}

export async function postMultipleJobAttachments(
	simproJobId: string,
	payload: any
) {
	// Make API post request
	const response: AxiosResponse = await simproApiService.post(
		postMultipleJobAttachmentsRoute(simproJobId),
		payload
	);

	return response.data;
}
