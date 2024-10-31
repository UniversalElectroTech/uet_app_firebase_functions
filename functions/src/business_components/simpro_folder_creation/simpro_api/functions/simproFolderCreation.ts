import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getSimproJobFolders } from "./getSimproJobFolders";
import { getSimproFolderJobs } from "./getSimproFolderJobs";
import { createSimproJobFolder } from "./createSimproJobFolder";
import { postSimproJobFolder } from "./postSimproJobFolder";
import { deleteSimproJobFolder } from "./deleteSimproJobFolder";

exports.getSimproFolderJobs = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getSimproFolderJobs(request);
	}
);

exports.getSimproJobFolders = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getSimproJobFolders(request);
	}
);

exports.createSimproJobFolder = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await createSimproJobFolder(request);
	}
);

exports.postSimproJobFolder = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await postSimproJobFolder(request);
	}
);

exports.deleteSimproJobFolder = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await deleteSimproJobFolder(request);
	}
);
