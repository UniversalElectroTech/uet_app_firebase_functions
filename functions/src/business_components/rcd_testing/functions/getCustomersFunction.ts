import axios, { AxiosError } from "axios";
import {
	CallableRequest,
	HttpsError,
	onCall,
} from "firebase-functions/v2/https";
import { Customer } from "../models/customer";
import { getRcdJobCustomersRoute } from "../services/simpro_api/routes";
import { SimproApiService } from "../../../global/services/simpro_api/simproApiService";

// Returns all customers with RCD testings jobs from the SimproAPI
exports.getCustomers = onCall(async (request: CallableRequest) => {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be " + "called while authenticated."
		);
	}

	try {
		// Prepare SimproAPIService
		const simproApiService = new SimproApiService();

		const { page, returnCount } = request.data;

		// GET customers with rcd jobs via SimproAPI
		const customerResponse = await simproApiService.get(
			getRcdJobCustomersRoute(returnCount, page)
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

		const uniqueCustomers: Map<number, Customer> = new Map();
		for (const jobJson of customerList) {
			const customerData = jobJson["Customer"];
			const customerId: number = customerData["ID"];

			if (!uniqueCustomers.has(customerId)) {
				const customer: Customer = Customer.fromMap(customerData);
				uniqueCustomers.set(customerId, customer);
			}
		}

		// Return a map with customer data, result total and result count
		const returnMap = {
			customers: uniqueCustomers,
			resultTotal: customerResponse.headers["result-total"],
			resultCount: customerResponse.headers["result-count"],
		};

		return returnMap;
	} catch (error: any) {
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError<{ errorMessage?: string }>;
			const errorMessage =
				axiosError.response?.data?.errorMessage ||
				axiosError.message ||
				"An error occurred";
			throw new HttpsError("internal", errorMessage);
		} else {
			throw new HttpsError("internal", "An unknown error occurred");
		}
	}
});
