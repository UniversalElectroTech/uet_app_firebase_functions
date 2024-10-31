import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getEmployeesRoute } from "../config/routes";
import { simproApiService } from "../simproApiService";
import { handleAxiosError } from "../../helper_functions/errorHandling";
import { AxiosResponse } from "axios";

// returns all employees in Simpro
export async function getAllEmployees(request: CallableRequest) {
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
		return handleAxiosError(error);
	}
}
