import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { postjobNoteRoute } from "../config/routes";
import { simproApiService } from "../simproApiService";
import { handleAxiosError } from "../../helper_functions/errorHandling";
import { AxiosResponse } from "axios";

// adds one of item to job
export async function postJobNoteHandler(request: CallableRequest) {
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
			subject,
			note,
			isVisibleToCustomer,
		}: {
			simproJobId: string;
			subject: string;
			note: string;
			isVisibleToCustomer: boolean;
		} = request.data;

		// Check if all required parameters have been received
		if (!simproJobId || !subject || !note) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		return await postJobNote(simproJobId, subject, note, isVisibleToCustomer);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

export async function postJobNote(
	simproJobId: string,
	subject: string,
	note: string,
	isVisibleToCustomer: boolean
) {
	// Prepare payload
	const payload = {
		Subject: subject,
		Note: note,
		Visibility: { Customer: isVisibleToCustomer },
	};

	// Put one off item in Simpro job
	const response: AxiosResponse = await simproApiService.post(
		postjobNoteRoute(simproJobId),
		payload
	);

	// Return response data
	return response.data;
}
