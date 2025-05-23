import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getRcdJobCustomersRoute } from "../config/routes";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";

// Returns all customers with RCD testings jobs from the SimproAPI
export async function getAllCustomersHandler(request: CallableRequest) {
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
			page,
			returnCount,
			employeeSimproId,
		}: { page: number; returnCount: number; employeeSimproId: string } =
			request.data;

		// Check if all required parameters have been received
		if (
			page === undefined ||
			page === null ||
			returnCount === undefined ||
			returnCount === null ||
			!employeeSimproId
		) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		return await getAllCustomers(page, returnCount, employeeSimproId);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function getAllCustomers(
	page: number,
	returnCount: number,
	employeeSimproId: string
) {
	// GET customers with rcd jobs via SimproAPI
	const customerResponse = await simproApiService.get(
		getRcdJobCustomersRoute(employeeSimproId, returnCount, page)
	);
	const customerList: any[] = customerResponse.data;

	// Check if no customers returned from request and if so return the empty list
	if (customerList.length === 0) {
		const returnMap = {
			customers: [],
			resultTotal: customerResponse.headers["result-total"],
			resultCount: customerResponse.headers["result-count"],
		};
		return returnMap;
	}

	// Return a map with customer data, result total and result count
	const returnMap = {
		customers: customerList,
		resultTotal: customerResponse.headers["result-total"],
		resultCount: customerResponse.headers["result-count"],
	};

	return returnMap;
}
