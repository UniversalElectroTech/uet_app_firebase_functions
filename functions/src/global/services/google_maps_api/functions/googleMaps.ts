import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getGeocodeByAddress } from "./getGeocodeByAddress";

// Returns all RCD testing complete jobs from the SimproAPI
exports.getGeocodeByAddress = onCall(
	{ timeoutSeconds: 2, maxInstances: 10 },
	async (request: CallableRequest) => {
		return await getGeocodeByAddress(request);
	}
);
