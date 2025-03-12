import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getCompleteJobsHandler } from "../handlers/getCompleteJobsFunctionHandler";
import { getAllCustomersHandler } from "../handlers/getAllCustomersFunctionHandler";
import { getProgressJobsHandler } from "../handlers/getProgressJobsFunctionHandler";
import { getJobDetailsHandler } from "../handlers/getJobDetailsHandler";

// Returns all RCD testing complete jobs from the SimproAPI
exports.getCompleteJobs = onCall(
	{ timeoutSeconds: 10, maxInstances: 2, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getCompleteJobsHandler(request);
	}
);

// Returns all customers with RCD testings jobs from the SimproAPI
exports.getAllCustomers = onCall(
	{ timeoutSeconds: 10, maxInstances: 2, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getAllCustomersHandler(request);
	}
);

// Returns all RCD testing progress jobs from the SimproAPI
exports.getProgressJobs = onCall(
	{ timeoutSeconds: 10, maxInstances: 2, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getProgressJobsHandler(request);
	}
);

// Returns all job details from the SimproAPI
exports.getJobDetails = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getJobDetailsHandler(request);
	}
);
