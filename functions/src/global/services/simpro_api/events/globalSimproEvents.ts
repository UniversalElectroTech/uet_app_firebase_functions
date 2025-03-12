import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getAllEmployeesHandler } from "../handlers/getAllEmployeesHandler";
import { getFilteredSimproCustomersHandler } from "../handlers/getFilteredSimproCustomersHandler";
import { getJobDetailsHandler } from "../handlers/getJobDetailsHandler";
import { getJobSiteDetailsHandler } from "../handlers/getJobSiteDetailsHandler";
import { getScheduledJobsHandler } from "../handlers/getScheduledJobsHandler";
import { patchToggleJobStageHandler } from "../handlers/patchToggleJobStageHandler";
import { postJobAttachmentsHandler } from "../handlers/postJobAttachmentsHandler";
import { postJobNoteHandler } from "../handlers/postJobNoteHandler";
import { postJobOneOffItemHandler } from "../handlers/postJobOneOffItemHandler";

// Returns all RCD testing complete jobs from the SimproAPI
exports.getAllEmployees = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getAllEmployeesHandler(request);
	}
);

// Returns all RCD testing complete jobs from the SimproAPI
exports.patchToggleJobStage = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await patchToggleJobStageHandler(request);
	}
);

// Returns all RCD testing complete jobs from the SimproAPI
exports.postJobAttachments = onCall(
	{ timeoutSeconds: 10, maxInstances: 10, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await postJobAttachmentsHandler(request);
	}
);

// Returns all RCD testing complete jobs from the SimproAPI
exports.postJobOneOffItem = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await postJobOneOffItemHandler(request);
	}
);

// Returns all RCD testing complete jobs from the SimproAPI
exports.postJobNote = onCall(
	{ timeoutSeconds: 10, maxInstances: 10, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await postJobNoteHandler(request);
	}
);

// Returns all RCD testing complete jobs from the SimproAPI
exports.getFilteredSimproSuppliers = onCall(
	{ timeoutSeconds: 10, maxInstances: 10, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getFilteredSimproCustomersHandler(request);
	}
);

// Returns all RCD testing complete jobs from the SimproAPI
exports.getJobSiteDetails = onCall(
	{ timeoutSeconds: 10, maxInstances: 10, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getJobSiteDetailsHandler(request);
	}
);

// Returns all RCD testing complete jobs from the SimproAPI
exports.getJobDetails = onCall(
	{ timeoutSeconds: 10, maxInstances: 10, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getJobDetailsHandler(request);
	}
);

// Returns all RCD testing complete jobs from the SimproAPI
exports.getScheduledJobs = onCall(
	{ timeoutSeconds: 10, maxInstances: 10, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getScheduledJobsHandler(request);
	}
);
