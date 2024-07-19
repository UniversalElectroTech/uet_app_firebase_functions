import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getCctvJobDetails } from "./getCctvJobDetailsFunction";

// Returns cctv job details from the SimproAPI
exports.getCctvJobDetails = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getCctvJobDetails(request);
	}
);
