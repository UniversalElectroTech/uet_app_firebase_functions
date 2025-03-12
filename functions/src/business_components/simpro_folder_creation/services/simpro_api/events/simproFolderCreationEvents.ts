import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getSimproProjectFoldersHandler } from "../handlers/getSimproProjectFoldersHandler";
import { getSimproFolderProjectsHandler } from "../handlers/getSimproFolderProjectsHandler";
import { createSimproProjectFolderHandler } from "../handlers/createSimproProjectFolderHandler";
import { updateSimproProjectFolderHandler } from "../handlers/updateSimproProjectFolderHandler";
import { deleteSimproProjectFolderHandler } from "../handlers/deleteSimproProjectFolderHandler";

exports.getSimproFolderProjects = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getSimproFolderProjectsHandler(request);
	}
);

exports.getSimproProjectFolders = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getSimproProjectFoldersHandler(request);
	}
);

exports.createSimproProjectFolder = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await createSimproProjectFolderHandler(request);
	}
);

exports.updateSimproProjectFolder = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await updateSimproProjectFolderHandler(request);
	}
);

exports.deleteSimproProjectFolder = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await deleteSimproProjectFolderHandler(request);
	}
);
