import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFilteredSuppliersRoute as getFilteredCustomersRoute } from "../config/routes";
import { simproApiService } from "../simproApiService";
import { handleAxiosError } from "../../helper_functions/errorHandling";
import { AxiosResponse } from "axios";

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
		return handleAxiosError(error);
	}
}
