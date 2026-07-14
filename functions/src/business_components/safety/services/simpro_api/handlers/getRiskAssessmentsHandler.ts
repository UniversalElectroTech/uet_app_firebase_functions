import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";

export async function getRiskAssessmentsHandler(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const userId = request.auth.uid;
		const includeAll = request.data?.includeAll === true;

		if (includeAll) {
			if (!(await isAdmin(userId))) {
				throw new HttpsError(
					"permission-denied",
					"Admin access is required to view all risk assessments."
				);
			}
			return getAllRiskAssessments();
		}

		return getRiskAssessments(userId);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function getRiskAssessments(createdBy: string) {
	const db = getFirestore();

	const progressReportsSnapshot = await db
		.collection("risk_assessments")
		.where("createdBy", "==", createdBy)
		.where("status", "==", "progress")
		.orderBy("dateCreated", "desc")
		.get();

	const completeReportsSnapshot = await db
		.collection("risk_assessments")
		.where("createdBy", "==", createdBy)
		.where("status", "==", "complete")
		.orderBy("dateCreated", "desc")
		.get();

	const progressReports = progressReportsSnapshot.docs.map((doc) =>
		serializeRiskAssessmentListItem(doc.id, doc.data())
	);

	const completeReports = completeReportsSnapshot.docs.map((doc) =>
		serializeRiskAssessmentListItem(doc.id, doc.data())
	);

	return { progressReports, completeReports };
}

async function getAllRiskAssessments() {
	const db = getFirestore();

	const progressReportsSnapshot = await db
		.collection("risk_assessments")
		.where("status", "==", "progress")
		.orderBy("dateCreated", "desc")
		.get();

	const completeReportsSnapshot = await db
		.collection("risk_assessments")
		.where("status", "==", "complete")
		.orderBy("dateCreated", "desc")
		.get();

	const progressReports = progressReportsSnapshot.docs.map((doc) =>
		serializeRiskAssessmentListItem(doc.id, doc.data())
	);

	const completeReports = completeReportsSnapshot.docs.map((doc) =>
		serializeRiskAssessmentListItem(doc.id, doc.data())
	);

	return { progressReports, completeReports };
}

function serializeRiskAssessmentListItem(
	firebaseId: string,
	data: Record<string, any>
) {
	const dateCreated = data.dateCreated?.toDate
		? data.dateCreated.toDate().toISOString()
		: data.dateCreated;

	return {
		firebaseId,
		riskAssessmentId: data.riskAssessmentId ?? "",
		name: data.name ?? "",
		simproId: data.simproId ?? "",
		address: data.address ?? "",
		customer: data.customer ?? "",
		status: data.status ?? "",
		dateCreated,
		createdBy: data.createdBy ?? "",
		createdByDisplayName:
			data.createdByDisplayName ?? data.completedBy ?? "",
		completedBy: data.completedBy ?? "",
	};
}
