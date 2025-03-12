import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../simproApiService";
import { handleAxiosError } from "../../helper_functions/errorHandling";
import { AxiosResponse } from "axios";
import { getFilteredCustomersRoute } from "../config/routes";

// returns filtered supplier from Simpro
export async function getFilteredSimproCustomersHandler(
	request: CallableRequest
) {
	try {
		// Check that the user is authenticated.
		if (!request.auth) {
			// Throwing an HttpsError so that the client gets the error details.
			throw new HttpsError(
				"failed-precondition",
				"The function must be " + "called while authenticated."
			);
		}

		const { customerName: customerName }: { customerName: string } =
			request.data;

		return await getFilteredSimproCustomers(customerName);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

export async function getFilteredSimproCustomers(customerName: string) {
	const response: AxiosResponse<any> = await simproApiService.get(
		getFilteredCustomersRoute(customerName)
	);

	// Parse response and create list of employees
	const customerDataList: any[] = response.data;

	return customerDataList;
}
