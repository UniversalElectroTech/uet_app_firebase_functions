import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { createUserFromInviteHandler } from "../handlers/createUserFromInviteHandler";
import { deleteUserHandler } from "../handlers/deleteUserHandler";
import { deleteUserInviteHandler } from "../handlers/deleteUserInviteHandler";
import { firebaseFunctionsService } from "../../../firebase_functions/services/firebaseFunctionsService";

// Creates a user using the invite token sent to them
exports.createUserFromInvite = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		firebaseFunctionsService;
		return await createUserFromInviteHandler(request);
	}
);

// Removes the pending account from the user
exports.deleteUserInvite = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		firebaseFunctionsService;
		return await deleteUserInviteHandler(request);
	}
);

// Deletes the users auth account
exports.deleteUser = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		firebaseFunctionsService;
		return await deleteUserHandler(request);
	}
);
