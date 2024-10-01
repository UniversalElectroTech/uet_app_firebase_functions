import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import axios, { AxiosResponse, AxiosError } from "axios";
import { getFilteredSuppliersRoute } from "../config/routes";
import { simproApiService } from "../simproApiService";

// returns filtered supplier from Simpro
export async function getFilteredSimproSuppliers(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be " + "called while authenticated."
		);
	}

	try {
		const { supplierName }: { supplierName: string } = request.data;

		const response: AxiosResponse<any> = await simproApiService.get(
			getFilteredSuppliersRoute(supplierName)
		);

		// Parse response and create list of employees
		const supplierDataList: any[] = response.data;

		return supplierDataList;
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
