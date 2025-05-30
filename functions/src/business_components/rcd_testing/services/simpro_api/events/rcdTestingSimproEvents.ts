import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getCompleteJobsHandler } from "../handlers/getCompleteJobsFunctionHandler";
import { getAllCustomersHandler } from "../handlers/getAllCustomersFunctionHandler";
import { getProgressJobsHandler } from "../handlers/getProgressJobsFunctionHandler";
import { getDbsHandler } from "../handlers/db/getDbsHandler";
import { getDbDetailsHandler } from "../handlers/db/getDbDetailsHandler";
import { deleteRcdsHandler } from "../handlers/rcd/deleteRcdsHandler";
import { deleteDbHandler } from "../handlers/db/deleteDbHandler";
import { createDbHandler } from "../handlers/db/createDbHandler";
import { addRcdsHandler } from "../handlers/rcd/addRcdsHandler";
import { updateRcdsHandler } from "../handlers/rcd/updateRcdsHandler";
import { updateDbHandler } from "../handlers/db/updateDbHandler";
import { getDbRcdsHandler } from "../handlers/rcd/getDbRcdsHandler";
import { addDbImagesHandler } from "../handlers/db/addDbImagesHandler";
import { deleteDbImagesHandler } from "../handlers/db/deleteDbImagesHandler";
import { getJobHandler } from "../handlers/job/getJobHandler";
import { postCompleteRcdJobHandler } from "../handlers/job/postCompleteRcdJobHandler";
import { updateJobHandler } from "../handlers/job/postUpdateJobHandler";
import { shareJobHandler } from "../handlers/job/postShareJob";
import { unshareJobHandler } from "../handlers/job/postUnshareJob";

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

// Returns all distribution boards from the SimproAPI
exports.getDbs = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getDbsHandler(request);
	}
);

// Returns the details of a distribution board from the SimproAPI
exports.getDbDetails = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getDbDetailsHandler(request);
	}
);

// Deletes RCDs from a distribution board in the SimproAPI
exports.deleteRcds = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await deleteRcdsHandler(request);
	}
);

// Deletes a distribution board from the SimproAPI
exports.deleteDb = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await deleteDbHandler(request);
	}
);

// Creates a distribution board in the SimproAPI
exports.createDb = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await createDbHandler(request);
	}
);

// Adds RCDs to a distribution board in the SimproAPI
exports.addRcds = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await addRcdsHandler(request);
	}
);

// Updates RCDs in a distribution board in the SimproAPI
exports.updateRcds = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await updateRcdsHandler(request);
	}
);

// Updates a distribution board in the SimproAPI
exports.updateDb = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await updateDbHandler(request);
	}
);

// Returns all RCDs from a distribution board in the SimproAPI
exports.getDbRcds = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getDbRcdsHandler(request);
	}
);

// Adds images to a distribution board in the SimproAPI
exports.addDbImages = onCall(
	{ timeoutSeconds: 20, maxInstances: 5, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await addDbImagesHandler(request);
	}
);

// Deletes images from a distribution board in the SimproAPI
exports.deleteDbImages = onCall(
	{ timeoutSeconds: 20, maxInstances: 5, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await deleteDbImagesHandler(request);
	}
);

// Returns a job from the SimproAPI
exports.getJob = onCall(
	{ timeoutSeconds: 20, maxInstances: 5, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getJobHandler(request);
	}
);

// Completes an RCD testing job in the SimproAPI
exports.completeRcdJob = onCall(
	{ timeoutSeconds: 60, maxInstances: 5, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await postCompleteRcdJobHandler(request);
	}
);

// Updates a job in the SimproAPI
exports.updateJob = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await updateJobHandler(request);
	}
);

// Shares a job in the SimproAPI
exports.shareJob = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await shareJobHandler(request);
	}
);

// Unshares a job in the SimproAPI
exports.unshareJob = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await unshareJobHandler(request);
	}
);
