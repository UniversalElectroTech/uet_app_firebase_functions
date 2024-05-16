import { HttpsError } from "firebase-functions/v2/https";
import axios, { AxiosError } from "axios";
import { getRcdCompleteJobsRoute } from "../config/routes";
import { getSitesRoute } from "../../../../../global/services/simpro_api/config/routes";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";

// Returns all RCD testing complete jobs from the SimproAPI
export async function getCompleteJobs(request: any) {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be " + "called while authenticated."
		);
	}

	try {
		// Extract and validate data from the client
		const {
			page,
			returnCount,
			customerSimproId,
		}: { page: number; returnCount: number; customerSimproId: string } =
			request.data;

		// Check if all required parameters have been received
		if (
			page === undefined ||
			page === null ||
			returnCount === undefined ||
			returnCount === null ||
			!customerSimproId
		) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		// GET rcd progress jobs via SimproAPI
		const jobResponse = await simproApiService.get(
			getRcdCompleteJobsRoute(customerSimproId, returnCount, page)
		);
		const jobList: any[] = jobResponse.data;

		// Check if no jobs returned from request and if so return the empty list
		if (jobList.length === 0) {
			const returnMap = {
				jobs: [],
				siteAddresses: [],
				resultTotal: jobResponse.headers["result-total"],
				resultCount: jobResponse.headers["result-count"],
			};
			return returnMap;
		}

		// Collect and prepare all job site IDs from jobs for subsequent SimproAPI request
		const siteIds: string[] = jobList.map((job) =>
			job["Site"]["ID"].toString()
		);
		const siteAddressIds: string = siteIds.join(",");

		// GET job site information via SimproAPI
		const siteAddressResponse = await simproApiService.get(
			getSitesRoute(siteAddressIds)
		);
		const siteAddressList: any[] = siteAddressResponse.data;

		// Return a map with job data, result total and result count
		const returnMap = {
			jobs: jobList,
			siteAddresses: siteAddressList,
			resultTotal: jobResponse.headers["result-total"],
			resultCount: jobResponse.headers["result-count"],
		};
		return returnMap;
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
