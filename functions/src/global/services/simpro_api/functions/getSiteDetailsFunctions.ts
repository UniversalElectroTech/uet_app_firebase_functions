// import axios, { AxiosError } from "axios";
// import { HttpsError } from "firebase-functions/v2/https";
// import { simproApiService } from "../simproApiService";
// import { getSitesRoute } from "../config/routes";

// // Returns all customers with RCD testings jobs from the SimproAPI
// export async function getAllCustomers(request: any) {
// 	// Check that the user is authenticated.
// 	if (!request.auth) {
// 		// Throwing an HttpsError so that the client gets the error details.
// 		throw new HttpsError(
// 			"failed-precondition",
// 			"The function must be " + "called while authenticated."
// 		);
// 	}

// 	try {
// 		const { page, returnCount }: { page: number; returnCount: number } =
// 			request.data;

// 		// Check if all required parameters have been received
// 		if (
// 			page === undefined ||
// 			page === null ||
// 			returnCount === undefined ||
// 			returnCount === null
// 		) {
// 			throw new HttpsError(
// 				"failed-precondition",
// 				"Required parameters are missing."
// 			);
// 		}

// // GET job site information via SimproAPI
// const siteAddressResponse = await simproApiService.get(
//     getSitesRoute(siteAddressIds)
// );
// const siteAddressList: any[] = siteAddressResponse.data;

// 		// Check if no customers returned from request and if so return the empty list
// 		if (siteAddressList.length === 0) {
// 			const returnMap = {
// 				customers: [],
// 				resultTotal: customerResponse.headers["result-total"],
// 				resultCount: customerResponse.headers["result-count"],
// 			};
// 			return returnMap;
// 		}

// 		// Return a map with customer data, result total and result count
// 		const returnMap = {
// 			customers: customerList,
// 			resultTotal: customerResponse.headers["result-total"],
// 			resultCount: customerResponse.headers["result-count"],
// 		};

// 		return returnMap;
// 	} catch (error: any) {
// 		if (axios.isAxiosError(error)) {
// 			const axiosError = error as AxiosError<{ errorMessage?: string }>;
// 			const errorMessage =
// 				axiosError.response?.data?.errorMessage ||
// 				axiosError.message ||
// 				"An error occurred";
// 			throw new HttpsError("internal", errorMessage);
// 		} else {
// 			throw error;
// 		}
// 	}
// }
