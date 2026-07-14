import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getRiskAssessmentJobDetailsHandler } from "../handlers/getRiskAssessmentJobDetailsHandler";
import { getRiskAssessmentsHandler } from "../handlers/getRiskAssessmentsHandler";
import { updateRiskAssessmentHandler } from "../handlers/updateRiskAssessmentHandler";
import { deleteRiskAssessmentHandler } from "../handlers/deleteRiskAssessmentHandler";
import { completeRiskAssessmentHandler } from "../handlers/completeRiskAssessmentHandler";
import { duplicateRiskAssessmentHandler } from "../handlers/duplicateRiskAssessmentHandler";

exports.getRiskAssessmentJobDetails = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getRiskAssessmentJobDetailsHandler(request);
	}
);

exports.getRiskAssessments = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getRiskAssessmentsHandler(request);
	}
);

exports.updateRiskAssessment = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await updateRiskAssessmentHandler(request);
	}
);

exports.deleteRiskAssessment = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await deleteRiskAssessmentHandler(request);
	}
);

exports.completeRiskAssessment = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await completeRiskAssessmentHandler(request);
	}
);

exports.duplicateRiskAssessment = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await duplicateRiskAssessmentHandler(request);
	}
);
