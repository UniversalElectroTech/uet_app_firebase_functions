import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { inviteEmployeeToApp } from "./inviteEmployeeToAppFunction";
import { firebaseFunctionsService } from "../../../firebaseFunctions/services/firebaseFunctionsServ";

// Returns all RCD testing complete jobs from the SimproAPI
exports.inviteEmployeeToApp = onCall(
	{ timeoutSeconds: 10, maxInstances: 1 },
	async (request: CallableRequest) => {
		firebaseFunctionsService;
		return await inviteEmployeeToApp(request);
	}
);
