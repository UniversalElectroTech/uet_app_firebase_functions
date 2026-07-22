import { CallableRequest, onCall } from "firebase-functions/v2/https";
import { getRiskAssessmentJobDetailsHandler } from "../handlers/getRiskAssessmentJobDetailsHandler";
import { getRiskAssessmentsHandler } from "../handlers/getRiskAssessmentsHandler";
import { updateRiskAssessmentHandler } from "../handlers/updateRiskAssessmentHandler";
import { deleteRiskAssessmentHandler } from "../handlers/deleteRiskAssessmentHandler";
import { completeRiskAssessmentHandler } from "../handlers/completeRiskAssessmentHandler";
import { duplicateRiskAssessmentHandler } from "../handlers/duplicateRiskAssessmentHandler";

const standardOpts = {
	timeoutSeconds: 30,
	maxInstances: 10,
	enforceAppCheck: true,
};

const completeOpts = {
	timeoutSeconds: 120,
	memory: "512MiB" as const,
	maxInstances: 20,
	enforceAppCheck: true,
};

exports.getRiskAssessmentJobDetails = onCall(
	standardOpts,
	async (request: CallableRequest) => {
		return await getRiskAssessmentJobDetailsHandler(request);
	}
);

exports.getRiskAssessments = onCall(
	standardOpts,
	async (request: CallableRequest) => {
		return await getRiskAssessmentsHandler(request);
	}
);

exports.updateRiskAssessment = onCall(
	standardOpts,
	async (request: CallableRequest) => {
		return await updateRiskAssessmentHandler(request);
	}
);

exports.deleteRiskAssessment = onCall(
	standardOpts,
	async (request: CallableRequest) => {
		return await deleteRiskAssessmentHandler(request);
	}
);

exports.completeRiskAssessment = onCall(
	completeOpts,
	async (request: CallableRequest) => {
		return await completeRiskAssessmentHandler(request);
	}
);

exports.duplicateRiskAssessment = onCall(
	standardOpts,
	async (request: CallableRequest) => {
		return await duplicateRiskAssessmentHandler(request);
	}
);
