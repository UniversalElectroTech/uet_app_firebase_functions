import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getCctvJobDetailsHandler } from "../handlers/getCctvJobDetailsHandler";

// Returns cctv job details from the SimproAPI
exports.getCctvJobDetails = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getCctvJobDetailsHandler(request);
	}
);
