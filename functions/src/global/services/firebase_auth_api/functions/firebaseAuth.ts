import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { createUserFromInvite } from "./createUserFromInviteFunction";

// Returns all RCD testing complete jobs from the SimproAPI
exports.createUserFromInvite = onCall(
	{ timeoutSeconds: 10, maxInstances: 1 },
	async (request: CallableRequest) => {
		return await createUserFromInvite(request);
	}
);
