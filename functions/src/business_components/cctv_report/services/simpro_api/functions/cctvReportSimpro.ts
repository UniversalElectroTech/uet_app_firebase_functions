import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getCctvJobDetails } from "./getCctvJobDetails";

// Returns cctv job details from the SimproAPI
exports.getCctvJobDetails = onCall(
	{ timeoutSeconds: 1, maxInstances: 1 },
	async (request: CallableRequest) => {
		return await getCctvJobDetails(request);
	}
);
