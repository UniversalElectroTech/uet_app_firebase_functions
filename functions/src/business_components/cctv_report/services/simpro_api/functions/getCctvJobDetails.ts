import axios, { AxiosError } from "axios";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { CctvJob } from "../../../models/cctvJob";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import { getJobDetailsRoute } from "../../../../../global/services/simpro_api/config/routes";

export async function getCctvJobDetails(request: CallableRequest) {
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

		// GET job details by ID via SimproAPI
		const jobResponse = await simproApiService.get(
			getJobDetailsRoute(simproJobId)
		);

		// Assuming CctvJob has a fromMap method similar to your Dart code
		const cctvJob = CctvJob.fromMap(jobResponse.data);

		return cctvJob.toMap();
	} catch (error: any) {
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError<{ errorMessage?: string }>;
			const errorMessage =
				axiosError.response?.data?.errorMessage ||
				axiosError.message ||
				"An error occurred";
			throw new HttpsError("internal", errorMessage);
		} else {
			throw error;
		}
	}
}
