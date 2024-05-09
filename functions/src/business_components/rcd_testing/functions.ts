import {
	onCall,
	HttpsError,
	CallableRequest,
} from "firebase-functions/v2/https";
import axios, { AxiosError } from "axios";
import { rcdProgressJobsPath, sitesPath } from "./routes";
import { Job } from "./models/job";

const { initializeApp } = require("firebase-admin/app");

initializeApp();

exports.getProgressJobs = onCall(async (request: CallableRequest) => {
	// Extract and validate data from the client
	const { page, returnCount, customerSimproId } = request.data;

	if (!page || !returnCount || !customerSimproId) {
		throw new HttpsError(
			"invalid-argument",
			"Required parameters are missing."
		);
	}
	if (!page || !returnCount || !customerSimproId) {
		throw new Error("Required parameters are missing.");
	}
	try {
		const jobResponse = await axios.get(
			`${rcdProgressJobsPath(customerSimproId, returnCount, page)}`
		);
		const jobList: any[] = jobResponse.data;

		if (jobList.length === 0) {
			const returnMap = {
				jobs: [],
				resultTotal: jobResponse.headers["result-total"],
				resultCount: jobResponse.headers["result-count"],
			};
			return returnMap;
		}

		const siteIds: string[] = jobList.map((job) =>
			job["Site"]["ID"].toString()
		);

		const siteAddressIds: string = siteIds.join(",");
		const siteAddressResponse = await axios.get(sitesPath(siteAddressIds));
		const siteAddressList: any[] = siteAddressResponse.data;

		const jobs: Job[] = jobList.map((jobJson) => {
			const siteId: string = jobJson["Site"]["ID"].toString();
			const siteData: any =
				siteAddressList.find((site) => site["ID"].toString() === siteId) || {};
			const job: Job = Job.fromSimproMap({
				jobData: jobJson,
				siteData: siteData,
			});
			return job;
		});

		const returnMap = {
			jobs,
			resultTotal: jobResponse.headers["result-total"],
			resultCount: jobResponse.headers["result-count"],
		};
		return returnMap;
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
