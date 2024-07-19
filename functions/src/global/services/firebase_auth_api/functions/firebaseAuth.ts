import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { createUserFromInvite } from "./createUserFromInviteFunction";
import { deleteUser } from "./deleteUserFunction";
import { deleteUserInvite } from "./deleteUserInviteFunction";
import { firebaseFunctionsService } from "../../../firebaseFunctions/services/firebaseFunctionsServ";

// Creates a user using the invite token sent to them
exports.createUserFromInvite = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		firebaseFunctionsService;
		return await createUserFromInvite(request);
	}
);

// Removes the pending account from the user
exports.deleteUserInvite = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		firebaseFunctionsService;
		return await deleteUserInvite(request);
	}
);

// Deletes the users auth account
exports.deleteUser = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		firebaseFunctionsService;
		return await deleteUser(request);
	}
);
