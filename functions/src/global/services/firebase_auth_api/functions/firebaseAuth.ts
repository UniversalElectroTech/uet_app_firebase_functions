import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { addEmployeeToApp } from "./addEmployeeToApp";

// Returns all RCD testing complete jobs from the SimproAPI
exports.addEmployeeToApp = onCall(
	{ timeoutSeconds: 2, maxInstances: 1 },
	async (request: CallableRequest) => {
		return await addEmployeeToApp(request);
	}
);
