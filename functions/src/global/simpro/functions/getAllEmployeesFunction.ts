import { onCall, HttpsError } from "firebase-functions/v2/https";
import axios, { AxiosResponse, AxiosError } from "axios";
import { getEmployeesRoute } from "../routes";
import { Employee } from "../model/employee";

exports.getAllEmployees = onCall(async () => {
	try {
		const response: AxiosResponse<any> = await axios.get(getEmployeesRoute());

		// Parse response and create list of employees
		const employeeDataList: any[] = response.data;
		const employees: Employee[] = employeeDataList.map((employeeData) =>
			Employee.fromSimproMap(employeeData)
		);

		return employees;
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
			// Handle other types of errors
			throw new HttpsError("internal", "An unknown error occurred");
		}
	}
});
