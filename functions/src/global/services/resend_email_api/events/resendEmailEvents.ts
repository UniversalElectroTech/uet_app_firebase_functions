import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { inviteEmployeeToAppHandler } from "../handlers/inviteEmployeeToAppHandler";
import { firebaseFunctionsService } from "../../../firebase_functions/services/firebaseFunctionsService";

// Returns all RCD testing complete jobs from the SimproAPI
exports.inviteEmployeeToApp = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		firebaseFunctionsService;
		return await inviteEmployeeToAppHandler(request);
	}
);
