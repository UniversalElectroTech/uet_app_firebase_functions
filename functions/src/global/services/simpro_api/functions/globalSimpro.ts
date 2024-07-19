import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getAllEmployees } from "./getAllEmployeesFunction";
import { patchToggleJobStage } from "./patchToggleJobStageFunction";
import { postJobAttachments } from "./postJobAttachmentsFunction";
import { postJobOneOffItem } from "./postJobOneOffItemFunction";

// Returns all RCD testing complete jobs from the SimproAPI
exports.getAllEmployees = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getAllEmployees(request);
	}
);

// Returns all RCD testing complete jobs from the SimproAPI
exports.patchToggleJobStage = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await patchToggleJobStage(request);
	}
);

// Returns all RCD testing complete jobs from the SimproAPI
exports.postJobAttachments = onCall(
	{ timeoutSeconds: 10, maxInstances: 10, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await postJobAttachments(request);
	}
);

// Returns all RCD testing complete jobs from the SimproAPI
exports.postJobOneOffItem = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await postJobOneOffItem(request);
	}
);
