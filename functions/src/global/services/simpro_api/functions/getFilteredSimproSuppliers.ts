import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import axios, { AxiosResponse, AxiosError } from "axios";
import { getFilteredSuppliersRoute as getFilteredCustomersRoute } from "../config/routes";
import { simproApiService } from "../simproApiService";

// returns filtered supplier from Simpro
export async function getFilteredSimproCustomers(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be " + "called while authenticated."
		);
	}

	try {
		const { customerName: customerName }: { customerName: string } =
			request.data;

		const response: AxiosResponse<any> = await simproApiService.get(
			getFilteredCustomersRoute(customerName)
		);

		// Parse response and create list of employees
		const customerDataList: any[] = response.data;

		return customerDataList;
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
