import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getCctvJobDetails } from "./getCctvJobDetails";

// Returns cctv job details from the SimproAPI
exports.getCctvJobDetails = onCall(async (request: CallableRequest) => {
	await getCctvJobDetails(request);
});
