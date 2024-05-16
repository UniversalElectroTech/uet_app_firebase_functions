import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getCompleteJobs } from "./getCompleteJobsFunction";
import { getAllCustomers } from "./getAllCustomersFunction";
import { getProgressJobs } from "./getProgressJobsFunction";
import { getJobDetails } from "./getJobDetails";

// Returns all RCD testing complete jobs from the SimproAPI
exports.getCompleteJobs = onCall(
	{ timeoutSeconds: 1, maxInstances: 1 },
	async (request: CallableRequest) => {
		return await getCompleteJobs(request);
	}
);

// Returns all customers with RCD testings jobs from the SimproAPI
exports.getAllCustomers = onCall(
	{ timeoutSeconds: 1, maxInstances: 1 },
	async (request: CallableRequest) => {
		return await getAllCustomers(request);
	}
);

// Returns all RCD testing progress jobs from the SimproAPI
exports.getProgressJobs = onCall(
	{ timeoutSeconds: 1, maxInstances: 1 },
	async (request: CallableRequest) => {
		return await getProgressJobs(request);
	}
);

// Returns all job details from the SimproAPI
exports.getJobDetails = onCall(
	{ timeoutSeconds: 1, maxInstances: 1 },
	async (request: CallableRequest) => {
		return await getJobDetails(request);
	}
);
