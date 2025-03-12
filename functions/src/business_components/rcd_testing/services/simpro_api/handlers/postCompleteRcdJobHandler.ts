import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import {
	getJobDetailsRoute,
	getSitesRoute,
	postMultipleJobAttachmentsRoute,
} from "../../../../../global/services/simpro_api/config/routes";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";

export async function postCompleteRcdJobHandler(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const {
			simproJobId,
			employeeName,
			job,
			payload,
		}: {
			simproJobId: string;
			employeeName: string;
			job: Map<string, any>;
			payload: Map<string, any>;
		} = request.data;

		// Check if all required parameters have been received
		if (!simproJobId || !employeeName || !job || !payload) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		return postCompleteRcdJob(simproJobId, employeeName, job, payload);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function postCompleteRcdJob(
	simproJobId: string,
	employeeName: string,
	job: Map<string, any>,
	payload: Map<string, any>
) {
	// Make API post request
	await simproApiService.post(
		postMultipleJobAttachmentsRoute(simproJobId),
		payload
	);

	// GET job details via SimproAPI
	const jobResponse = await simproApiService.get(
		getJobDetailsRoute(simproJobId)
	);
	const jobMap: any = jobResponse.data;

	// Extract site IDs
	const siteId = jobMap["Site"]["ID"].toString();

	// Fetch site address
	const siteAddressResponse = await simproApiService.get(getSitesRoute(siteId));
	const siteAddressMap: any = siteAddressResponse.data[0];

	return { jobData: jobMap, siteData: siteAddressMap };
}
