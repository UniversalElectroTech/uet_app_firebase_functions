import { CallableRequest, onCall } from "firebase-functions/v2/https";
import {
	getJobLabelDetailsHandler,
	getPurchaseOrderDetailsHandler,
} from "../handlers/getPurchaseOrderDetailsHandler";

exports.getPurchaseOrderDetails = onCall(
	{ timeoutSeconds: 10, maxInstances: 10, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getPurchaseOrderDetailsHandler(request);
	}
);

exports.getJobLabelDetails = onCall(
	{ timeoutSeconds: 10, maxInstances: 10, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getJobLabelDetailsHandler(request);
	}
);
