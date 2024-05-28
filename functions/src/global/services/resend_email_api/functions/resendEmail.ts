import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { inviteEmployeeToApp } from "./inviteEmployeeToAppFunction";

// Returns all RCD testing complete jobs from the SimproAPI
exports.inviteEmployeeToApp = onCall(
	{ timeoutSeconds: 10, maxInstances: 1 },
	async (request: CallableRequest) => {
		return await inviteEmployeeToApp(request);
	}
);
