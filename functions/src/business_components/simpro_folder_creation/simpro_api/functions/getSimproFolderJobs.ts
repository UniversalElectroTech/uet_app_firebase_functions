import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getSimproFolderJobsRoute } from "../config/routes";
import { simproApiService } from "../../../../global/services/simpro_api/simproApiService";
import { handleAxiosError } from "../../../../global/services/helper_functions/errorHandling";

export async function getSimproFolderJobs(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const { employeeSimproId }: { employeeSimproId: string } = request.data;

		// Check if all required parameters have been received
		if (!employeeSimproId) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		// Calculate the start and end dates of the current week (Monday to Sunday)
		const dateThisWeek = getCurrentWeekDates();

		// GET job details by ID via SimproAPI
		const jobResponse = await simproApiService.get(
			getSimproFolderJobsRoute(employeeSimproId, dateThisWeek)
		);

		const responseData: any[] = jobResponse.data;

		return responseData;
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

// Helper function to get the current week's dates in the required format
function getCurrentWeekDates(): string {
	const now = new Date();
	const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
	const monday = new Date(now);
	const sunday = new Date(now);

	// Calculate Monday (start of the week)
	monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
	// Calculate Sunday (end of the week)
	sunday.setDate(now.getDate() + ((7 - dayOfWeek) % 7));

	// Format dates as "YYYY-MM-DD"
	const formatDate = (date: Date) => date.toISOString().split("T")[0];
	return `${formatDate(monday)},${formatDate(sunday)}`;
}
