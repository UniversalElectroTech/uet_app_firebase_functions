import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getSwmsDocumentsHandler } from "../handlers/getSwmsDocumentsHandler";
import { getSwmsSignaturesHandler } from "../handlers/getSwmsSignaturesHandler";
import { getSwmsSettingsHandler } from "../handlers/getSwmsSettingsHandler";
import { saveSwmsSettingsHandler } from "../handlers/saveSwmsSettingsHandler";
import { addSwmsDocumentHandler } from "../handlers/addSwmsDocumentHandler";
import { renameSwmsDocumentHandler } from "../handlers/renameSwmsDocumentHandler";
import { replaceSwmsDocumentHandler } from "../handlers/replaceSwmsDocumentHandler";
import { softDeleteSwmsDocumentHandler } from "../handlers/softDeleteSwmsDocumentHandler";
import { softDeleteAllSwmsDocumentsHandler } from "../handlers/softDeleteAllSwmsDocumentsHandler";
import { submitSwmsSignaturesHandler } from "../handlers/submitSwmsSignaturesHandler";
import { invalidateSwmsSignaturesHandler } from "../handlers/invalidateSwmsSignaturesHandler";

const standardOpts = {
	timeoutSeconds: 10,
	maxInstances: 1,
	enforceAppCheck: true,
};

const uploadOpts = {
	timeoutSeconds: 120,
	memory: "512MiB" as const,
	maxInstances: 10,
	enforceAppCheck: true,
};

const signOpts = {
	timeoutSeconds: 60,
	memory: "512MiB" as const,
	maxInstances: 20,
	enforceAppCheck: true,
};

exports.getDocuments = onCall(standardOpts, async (request: CallableRequest) => {
	return await getSwmsDocumentsHandler(request);
});

exports.getSignatures = onCall(standardOpts, async (request: CallableRequest) => {
	return await getSwmsSignaturesHandler(request);
});

exports.getSettings = onCall(standardOpts, async (request: CallableRequest) => {
	return await getSwmsSettingsHandler(request);
});

exports.saveSettings = onCall(standardOpts, async (request: CallableRequest) => {
	return await saveSwmsSettingsHandler(request);
});

exports.addDocument = onCall(uploadOpts, async (request: CallableRequest) => {
	return await addSwmsDocumentHandler(request);
});

exports.renameDocument = onCall(standardOpts, async (request: CallableRequest) => {
	return await renameSwmsDocumentHandler(request);
});

exports.replaceDocument = onCall(uploadOpts, async (request: CallableRequest) => {
	return await replaceSwmsDocumentHandler(request);
});

exports.softDeleteDocument = onCall(
	standardOpts,
	async (request: CallableRequest) => {
		return await softDeleteSwmsDocumentHandler(request);
	}
);

exports.softDeleteAllDocuments = onCall(
	standardOpts,
	async (request: CallableRequest) => {
		return await softDeleteAllSwmsDocumentsHandler(request);
	}
);

exports.submitSignatures = onCall(
	signOpts,
	async (request: CallableRequest) => {
		return await submitSwmsSignaturesHandler(request);
	}
);

exports.invalidateSignatures = onCall(
	standardOpts,
	async (request: CallableRequest) => {
		return await invalidateSwmsSignaturesHandler(request);
	}
);
