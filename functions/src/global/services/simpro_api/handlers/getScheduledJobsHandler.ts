import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../simproApiService";
import { handleAxiosError } from "../../helper_functions/errorHandling";
import { getJobsDetailsRoute, getScheduledJobsRoute } from "../config/routes";
import { getEmployeeFromFirebase } from "../../firebase_firestore_api/handlers/getEmployeeHandler";

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

		const employeeFirebaseDocId = request.auth.uid;

		const employee = await getEmployeeFromFirebase(employeeFirebaseDocId);

		if (!employee) {
			throw new HttpsError("failed-precondition", "Employee not found.");
		}

		return await getScheduledJobs(employee.simproId);
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
	const monday = new Date(now);
	const sunday = new Date(now);

	// Get current day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
	const currentDay = now.getDay();

	// Calculate days to subtract to get to Monday
	const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;

	// Calculate days to add to get to Sunday
	const daysToSunday = currentDay === 0 ? 0 : 7 - currentDay;

	// Set dates
	monday.setDate(now.getDate() - daysToMonday);
	sunday.setDate(now.getDate() + daysToSunday);

	// Format dates as "YYYY-MM-DD"
	const formatDate = (date: Date) => date.toISOString().split("T")[0];
	return `${formatDate(monday)},${formatDate(sunday)}`;
}
