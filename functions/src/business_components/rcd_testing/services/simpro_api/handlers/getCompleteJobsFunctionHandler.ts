import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getRcdCompleteJobsRoute } from "../config/routes";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { getSiteDetails } from "./getProgressJobsFunctionHandler";

// Returns all RCD testing complete jobs from the SimproAPI
export async function getCompleteJobsHandler(request: CallableRequest) {
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
			employeeSimproId,
		}: {
			page: number;
			returnCount: number;
			customerSimproId: string;
			employeeSimproId: string;
		} = request.data;

		// Check if all required parameters have been received
		if (
			page === undefined ||
			page === null ||
			returnCount === undefined ||
			returnCount === null ||
			!customerSimproId ||
			!employeeSimproId
		) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		return await getCompleteJobs(
			page,
			returnCount,
			customerSimproId,
			employeeSimproId
		);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function getCompleteJobs(
	page: number,
	returnCount: number,
	customerSimproId: string,
	employeeSimproId: string
) {
	// GET rcd progress jobs via SimproAPI
	const jobResponse = await simproApiService.get(
		getRcdCompleteJobsRoute(
			employeeSimproId,
			customerSimproId,
			returnCount,
			page
		)
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
	const siteIds: string[] = jobList.map((job) => job["Site"]["ID"].toString());
	const siteAddressIds: string = siteIds.join(",");

	// GET job site information via SimproAPI
	const siteAddressResponse = await getSiteDetails(siteAddressIds, returnCount);
	const siteAddressList: any[] = siteAddressResponse;

	// Return a map with job data, result total and result count
	const returnMap = {
		jobs: jobList,
		siteAddresses: siteAddressList,
		resultTotal: jobResponse.headers["result-total"],
		resultCount: jobResponse.headers["result-count"],
	};
	return returnMap;
}
