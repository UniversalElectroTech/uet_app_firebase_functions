import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getContractorsRoute, getEmployeesRoute } from "../config/routes";
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
		const employeeResponse: AxiosResponse<any> = await simproApiService.get(
			getEmployeesRoute()
		);

		// Parse response and create list of employees
		const employeeDataList: any[] = employeeResponse.data;

		const contractorResponse: AxiosResponse<any> = await simproApiService.get(
			getContractorsRoute()
		);

		// Parse response and create list of employees
		const contractorDataList: any[] = contractorResponse.data;

		const totalDataList: any[] = [...employeeDataList, ...contractorDataList];

		return totalDataList;
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
