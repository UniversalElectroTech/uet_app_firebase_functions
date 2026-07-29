import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getSimproProjectFoldersHandler } from "../handlers/getSimproProjectFoldersHandler";
import { getSimproFolderProjectsHandler } from "../handlers/getSimproFolderProjectsHandler";
import { createSimproProjectFolderHandler } from "../handlers/createSimproProjectFolderHandler";
import { updateSimproProjectFolderHandler } from "../handlers/updateSimproProjectFolderHandler";
import { deleteSimproProjectFolderHandler } from "../handlers/deleteSimproProjectFolderHandler";
import { getSimproProjectFilesHandler } from "../handlers/getSimproProjectFilesHandler";
import { createSimproProjectFileHandler } from "../handlers/createSimproProjectFileHandler";
import { downloadSimproProjectFileHandler } from "../handlers/downloadSimproProjectFileHandler";
import { updateSimproProjectFileHandler } from "../handlers/updateSimproProjectFileHandler";
import { deleteSimproProjectFileHandler } from "../handlers/deleteSimproProjectFileHandler";

const defaultCallableOptions = {
	timeoutSeconds: 10,
	maxInstances: 1,
	enforceAppCheck: true,
};

const fileTransferCallableOptions = {
	timeoutSeconds: 540,
	memory: "2GiB" as const,
	maxInstances: 5,
	enforceAppCheck: true,
};

exports.getSimproFolderProjects = onCall(
	defaultCallableOptions,
	async (request: CallableRequest) => {
		return await getSimproFolderProjectsHandler(request);
	}
);

exports.getSimproProjectFolders = onCall(
	defaultCallableOptions,
	async (request: CallableRequest) => {
		return await getSimproProjectFoldersHandler(request);
	}
);

exports.createSimproProjectFolder = onCall(
	defaultCallableOptions,
	async (request: CallableRequest) => {
		return await createSimproProjectFolderHandler(request);
	}
);

exports.updateSimproProjectFolder = onCall(
	defaultCallableOptions,
	async (request: CallableRequest) => {
		return await updateSimproProjectFolderHandler(request);
	}
);

exports.deleteSimproProjectFolder = onCall(
	defaultCallableOptions,
	async (request: CallableRequest) => {
		return await deleteSimproProjectFolderHandler(request);
	}
);

exports.getSimproProjectFiles = onCall(
	{ ...defaultCallableOptions, timeoutSeconds: 30 },
	async (request: CallableRequest) => {
		return await getSimproProjectFilesHandler(request);
	}
);

exports.createSimproProjectFile = onCall(
	fileTransferCallableOptions,
	async (request: CallableRequest) => {
		return await createSimproProjectFileHandler(request);
	}
);

exports.downloadSimproProjectFile = onCall(
	fileTransferCallableOptions,
	async (request: CallableRequest) => {
		return await downloadSimproProjectFileHandler(request);
	}
);

exports.updateSimproProjectFile = onCall(
	defaultCallableOptions,
	async (request: CallableRequest) => {
		return await updateSimproProjectFileHandler(request);
	}
);

exports.deleteSimproProjectFile = onCall(
	defaultCallableOptions,
	async (request: CallableRequest) => {
		return await deleteSimproProjectFileHandler(request);
	}
);
