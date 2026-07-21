import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { inviteEmployeeToAppHandler } from "../handlers/inviteEmployeeToAppHandler";
import { sendPasswordResetEmailHandler } from "../handlers/sendPasswordResetEmailHandler";
import { firebaseFunctionsService } from "../../../firebase_functions/services/firebaseFunctionsService";

// Returns all RCD testing complete jobs from the SimproAPI
exports.inviteEmployeeToApp = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		firebaseFunctionsService;
		return await inviteEmployeeToAppHandler(request);
	}
);

// Sends a password reset email with a 1-hour expiring link
exports.sendPasswordResetEmail = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		firebaseFunctionsService;
		return await sendPasswordResetEmailHandler(request);
	}
);
