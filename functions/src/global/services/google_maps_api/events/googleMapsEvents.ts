import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getGeocodeByAddressHandler } from "../handlers/getGeocodeByAddressHandler";

// Returns all RCD testing complete jobs from the SimproAPI
exports.getGeocodeByAddress = onCall(
	{ timeoutSeconds: 10, maxInstances: 10, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getGeocodeByAddressHandler(request);
	}
);
