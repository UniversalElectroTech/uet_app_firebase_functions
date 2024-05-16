import axios, { AxiosError } from "axios";
import { HttpsError } from "firebase-functions/v2/https";
import { Job } from "../../../models/job";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import {
	getJobDetailsRoute,
	getSitesRoute,
} from "../../../../../global/services/simpro_api/config/routes";

export async function getJobDetails(request: any) {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const { simproJobId }: { simproJobId: string } = request.data;

		// Check if all required parameters have been received
		if (!simproJobId) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		// GET job details via SimproAPI
		const jobResponse = await simproApiService.get(
			getJobDetailsRoute(simproJobId)
		);
		const jobMap: any = jobResponse.data;

		// Extract site IDs
		const siteId = jobMap["Site"]["ID"].toString();

		// Fetch site address
		const siteAddressResponse = await simproApiService.get(
			getSitesRoute(siteId)
		);
		const siteAddressMap: any = siteAddressResponse.data[0];

		const job = Job.fromSimproMap({
			jobData: jobMap,
			siteData: siteAddressMap,
		});

		return job;
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
