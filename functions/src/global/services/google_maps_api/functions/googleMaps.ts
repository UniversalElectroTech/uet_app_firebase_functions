import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getGeocodeByAddress } from "./getGeocodeByAddressFunction";

// Returns all RCD testing complete jobs from the SimproAPI
exports.getGeocodeByAddress = onCall(
	{ timeoutSeconds: 10, maxInstances: 10 },
	async (request: CallableRequest) => {
		return await getGeocodeByAddress(request);
	}
);
