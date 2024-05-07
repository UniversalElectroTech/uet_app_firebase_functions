const { onRequest } = require("firebase-functions/v2/https");
import axios from "axios";
import { rcdProgressJobsPath, sitesPath } from "./routes";

// Define interfaces for Job and Site if needed

interface Job {
	// Define properties of Job interface
}

interface Site {
	// Define properties of Site interface
}

const { initializeApp } = require("firebase-admin/app");

initializeApp();

exports.getProgressJobs = onRequest(
	async (request: Request, response: Response) => {
		// Parse the URL to get the searchParams
		const url = new URL(request.url);
		const searchParams = url.searchParams;

		// Extract and validate query parameters
		const page = searchParams.get("page");
		const returnCount = searchParams.get("returnCount");
		const customerSimproId = searchParams.get("customerSimproId");

		// Check if required parameters are missing
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
				response.json(returnMap);
				return;
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
					siteAddressList.find((site) => site["ID"].toString() === siteId) ||
					{};
				const job: Job = createJobFromSimproMap(jobJson, siteData);
				return job;
			});

			const returnMap = {
				jobs,
				resultTotal: jobResponse.headers["result-total"],
				resultCount: jobResponse.headers["result-count"],
			};

			response.json(returnMap);
		} catch (error) {
			response
				.status(500)
				.send(error.response?.data?.errorMessage || "An error occurred");
		}
	}
);

function createJobFromSimproMap(jobData: any, siteData: any): Job {
	// Implement your logic to create Job object from jobData and siteData here
	return {} as Job;
}

// Define rcdProgressJobsPath and sitesPath functions as needed
