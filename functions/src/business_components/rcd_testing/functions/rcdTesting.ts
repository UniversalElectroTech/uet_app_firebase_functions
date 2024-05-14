import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getCompleteJobs } from "./getCompleteJobsFunction";
import { getCustomers } from "./getCustomersFunction";
import { getProgressJobs } from "./getProgressJobsFunction";

// Returns all RCD testing complete jobs from the SimproAPI
exports.getCompleteJobs = onCall(async (request: CallableRequest) => {
	await getCompleteJobs(request);
});

// Returns all customers with RCD testings jobs from the SimproAPI
exports.getCustomers = onCall(async (request: CallableRequest) => {
	await getCustomers(request);
});

// Returns all RCD testing progress jobs from the SimproAPI
exports.getProgressJobs = onCall(async (request: CallableRequest) => {
	await getProgressJobs(request);
});
