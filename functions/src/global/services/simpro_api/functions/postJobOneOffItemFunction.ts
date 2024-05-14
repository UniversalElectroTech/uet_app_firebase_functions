import { HttpsError } from "firebase-functions/v2/https";
import axios, { AxiosResponse, AxiosError } from "axios";
import { postOneOffItemRoute, getJobSectionsRoute } from "../routes";
import { simproApiService } from "../simproApiService";

// adds one of item to job
export async function postJobOneOffItem(request: any) {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be " + "called while authenticated."
		);
	}
	try {
		const { simproJobId, description, cost } = request.data;

		// Get section / costCenter ID
		const getResponse: AxiosResponse = await simproApiService.get(
			getJobSectionsRoute(simproJobId)
		);

		// Parse JSON response and extract sectionID and costCenterID
		const sections = getResponse.data["Sections"];
		const section = sections[0];
		const sectionID = section["ID"].toString();
		const costCenterID = section["CostCenters"][0]["ID"].toString();

		// Prepare payload
		const payload = [
			{
				Type: "Labor",
				Total: { Qty: 1 },
				SellPrice: cost,
				Description: description,
			},
		];

		// Put one off item in Simpro job
		const response: AxiosResponse = await simproApiService.put(
			postOneOffItemRoute(simproJobId, sectionID, costCenterID),
			payload
		);

		// Return response data
		return response.data;
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
}
