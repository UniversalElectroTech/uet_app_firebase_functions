import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { createCctvReportHandler } from "../handlers/createCctvReportHandler";
import { updateCctvReportHandler } from "../handlers/updateCctvReportHandler";
import { deleteCctvReportHandler } from "../handlers/deleteCctvReportHandler";
import { getCctvJobDetailsHandler } from "../handlers/getCctvJobDetailsHandler";
import { getCctvReportsHandler } from "../handlers/getCctvReportsHandler";
import { completeReportHandler as completeCctvReportHandler } from "../handlers/completeReportHandler";
// Returns cctv job details from the SimproAPI
exports.getCctvJobDetails = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getCctvJobDetailsHandler(request);
	}
);

// Returns cctv report jobs from the SimproAPI
exports.getCctvReports = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getCctvReportsHandler(request);
	}
);

// Returns cctv report jobs from the SimproAPI
exports.createCctvReport = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await createCctvReportHandler(request);
	}
);

// Returns cctv report jobs from the SimproAPI
exports.updateCctvReport = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await updateCctvReportHandler(request);
	}
);

exports.deleteCctvReport = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await deleteCctvReportHandler(request);
	}
);

exports.completeCctvReport = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await completeCctvReportHandler(request);
	}
);
