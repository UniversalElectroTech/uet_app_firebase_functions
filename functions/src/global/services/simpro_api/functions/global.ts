import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getAllEmployees } from "./getAllEmployeesFunction";
import { patchToggleJobStage } from "./patchToggleJobStageFunction";
import { postJobAttachments } from "./postJobAttachmentsFunction";
import { postJobOneOffItem } from "./postJobOneOffItemFunction";

// Returns all RCD testing complete jobs from the SimproAPI
exports.getAllEmployees = onCall(async (request: CallableRequest) => {
	await getAllEmployees(request);
});

// Returns all RCD testing complete jobs from the SimproAPI
exports.patchToggleJobStage = onCall(async (request: CallableRequest) => {
	await patchToggleJobStage(request);
});

// Returns all RCD testing complete jobs from the SimproAPI
exports.postJobAttachmens = onCall(async (request: CallableRequest) => {
	await postJobAttachments(request);
});

// Returns all RCD testing complete jobs from the SimproAPI
exports.postJobOneOffItem = onCall(async (request: CallableRequest) => {
	await postJobOneOffItem(request);
});
