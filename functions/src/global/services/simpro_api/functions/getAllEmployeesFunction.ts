import { HttpsError } from "firebase-functions/v2/https";
import axios, { AxiosResponse, AxiosError } from "axios";
import { getEmployeesRoute } from "../config/routes";
import { simproApiService } from "../simproApiService";

// returns all employees in Simpro
export async function getAllEmployees(request: any) {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be " + "called while authenticated."
		);
	}

	try {
		const response: AxiosResponse<any> = await simproApiService.get(
			getEmployeesRoute()
		);

		// Parse response and create list of employees
		const employeeDataList: any[] = response.data;

		return employeeDataList;
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
