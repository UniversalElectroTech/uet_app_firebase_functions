import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { createUserFromInvite } from "./createUserFromInviteFunction";
import { deleteUser } from "./deleteUserFunction";
import { deleteUserInvite } from "./deleteUserInviteFunction";

// Creates a user using the invite token sent to them
exports.createUserFromInvite = onCall(
	{ timeoutSeconds: 10, maxInstances: 1 },
	async (request: CallableRequest) => {
		return await createUserFromInvite(request);
	}
);

// Removes the pending account from the user
exports.deleteUserInvite = onCall(
	{ timeoutSeconds: 10, maxInstances: 1 },
	async (request: CallableRequest) => {
		return await deleteUserInvite(request);
	}
);

// Deletes the users auth account
exports.deleteUser = onCall(
	{ timeoutSeconds: 10, maxInstances: 1 },
	async (request: CallableRequest) => {
		return await deleteUser(request);
	}
);
