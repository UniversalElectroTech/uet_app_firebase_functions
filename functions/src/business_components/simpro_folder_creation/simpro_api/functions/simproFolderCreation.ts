import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getSimproProjectFolders } from "./getSimproProjectFolders";
import { getSimproFolderProjects } from "./getSimproFolderProjects";
import { createSimproProjectFolder } from "./createSimproProjectFolder";
import { updateSimproProjectFolder } from "./updateSimproProjectFolder";
import { deleteSimproProjectFolder } from "./deleteSimproProjectFolder";

exports.getSimproFolderProjects = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getSimproFolderProjects(request);
	}
);

exports.getSimproProjectFolders = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getSimproProjectFolders(request);
	}
);

exports.createSimproProjectFolder = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await createSimproProjectFolder(request);
	}
);

exports.updateSimproProjectFolder = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await updateSimproProjectFolder(request);
	}
);

exports.deleteSimproProjectFolder = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await deleteSimproProjectFolder(request);
	}
);
