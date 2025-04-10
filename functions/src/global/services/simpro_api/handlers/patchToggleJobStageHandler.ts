import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { patchJobStageRoute } from "../config/routes";
import { simproApiService } from "../simproApiService";
import { AxiosResponse } from "axios";
import { handleAxiosError } from "../../helper_functions/errorHandling";

// Updates job stage
export async function patchToggleJobStageHandler(request: CallableRequest) {
	try {
		if (!request.auth) {
			// Throwing an HttpsError so that the client gets the error details.
			throw new HttpsError(
				"failed-precondition",
				"The function must be " + "called while authenticated."
			);
		}

		const {
			simproJobId,
			description,
			currentStage,
			updateDescription,
		}: {
			simproJobId: string;
			description: string;
			currentStage: string;
			updateDescription: boolean;
		} = request.data;

		// Check if all required parameters have been received
		if (!simproJobId || !currentStage) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		return await patchToggleJobStage(
			simproJobId,
			currentStage,
			description,
			updateDescription
		);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

export async function patchToggleJobStage(
	simproJobId: string,
	currentStage: string,
	description: string,
	updateDescription: boolean
) {
	// Determine the stage based on the 'currentStage' argument
	const stage: string = currentStage === "Progress" ? "Complete" : "Progress";

	let payload: any;

	if (updateDescription) {
		payload = {
			Stage: stage,
			Description: description,
		};
	} else {
		payload = {
			Stage: stage,
		};
	}

	// Make API patch request
	const response: AxiosResponse = await simproApiService.patch(
		patchJobStageRoute(simproJobId),
		payload
	);

	// Return response data
	return response.data;
}
