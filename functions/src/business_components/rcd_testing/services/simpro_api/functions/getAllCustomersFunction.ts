import axios, { AxiosError } from "axios";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getRcdJobCustomersRoute } from "../config/routes";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";

// Returns all customers with RCD testings jobs from the SimproAPI
export async function getAllCustomers(request: CallableRequest) {
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
	} catch (error: any) {
		if (axios.isAxiosError(error)) {
			// Handle Axios errors
			const axiosError = error as AxiosError<{
				errors: Array<{ message: string }>;
			}>;
			const serverErrorMessage = axiosError.response?.data?.errors[0]?.message;
			const errorMessage =
				serverErrorMessage || axiosError.message || "An error occurred";
			throw new HttpsError("internal", errorMessage);
		} else if (error instanceof Error) {
			// Handle standard errors
			throw new HttpsError("internal", error.message || "An error occurred");
		} else {
			throw error;
		}
	}
}
