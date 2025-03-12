import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../simproApiService";
import { handleAxiosError } from "../../helper_functions/errorHandling";
import { getJobsDetailsRoute, getScheduledJobsRoute } from "../config/routes";

export async function getScheduledJobsHandler(request: CallableRequest) {
	try {
		// Check that the user is authenticated.
		if (!request.auth) {
			// Throwing an HttpsError so that the client gets the error details.
			throw new HttpsError(
				"failed-precondition",
				"The function must be called while authenticated."
			);
		}

		const { employeeSimproId }: { employeeSimproId: string } = request.data;

		// Check if all required parameters have been received
		if (!employeeSimproId) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		return await getScheduledJobs(employeeSimproId);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

export async function getScheduledJobs(employeeSimproId: string) {
	// Calculate the start and end dates of the current week (Monday to Sunday)
	const dateThisWeek = _getCurrentWeekDates();

	// GET job details by ID via SimproAPI
	const scheduleResponse = await simproApiService.get(
		getScheduledJobsRoute(employeeSimproId, dateThisWeek)
	);

	const simproJobIds: string[] = [];
	const scheduleResponseData: any[] = scheduleResponse.data;

	for (const schedule of scheduleResponseData) {
		const simproId = _extractSimproId(schedule["Reference"]);

		simproJobIds.push(simproId);
	}

	var jobResponseData: any[];

	if (simproJobIds.length != 0) {
		// GET quote details by ID via SimproAPI
		const jobResponse = await simproApiService.get(
			getJobsDetailsRoute(simproJobIds)
		);
		jobResponseData = jobResponse.data; // Extract job response data
	}

	// Loop through scheduleResponseData to add JobDetails
	for (const schedule of scheduleResponseData) {
		const simproId = _extractSimproId(schedule["Reference"]);

		// Find job details matching the simproId
		const jobDetail = jobResponseData!.find(
			(job: { ID: string }) => job.ID.toString() === simproId
		);
		if (jobDetail) {
			schedule.JobDetails = jobDetail; // Add job details to schedule
		}
	}

	return scheduleResponseData; // Return the updated schedule response data
}

// Helper function to extract simproId from reference
function _extractSimproId(reference: string): string {
	const referenceParts = reference.toString().split("-");
	return referenceParts.length > 0 ? referenceParts[0] : "";
}

// Helper function to get the current week's dates in the required format
function _getCurrentWeekDates(): string {
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
