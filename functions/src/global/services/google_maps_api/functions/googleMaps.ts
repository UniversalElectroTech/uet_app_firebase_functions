import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getGeocodeByAddress } from "./getGeocodeByAddress";

// Returns all RCD testing complete jobs from the SimproAPI
exports.getGeocodeByAddress = onCall(async (request: CallableRequest) => {
	await getGeocodeByAddress(request);
});
