import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import {
	QueryDocumentSnapshot,
	getFirestore,
} from "firebase-admin/firestore";
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

	const nameById = await resolveCreatorNames([
		...progressReportsSnapshot.docs,
		...completeReportsSnapshot.docs,
	]);

	const progressReports = progressReportsSnapshot.docs.map((doc) =>
		serializeRiskAssessmentListItem(doc.id, doc.data(), nameById)
	);

	const completeReports = completeReportsSnapshot.docs.map((doc) =>
		serializeRiskAssessmentListItem(doc.id, doc.data(), nameById)
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

	const nameById = await resolveCreatorNames([
		...progressReportsSnapshot.docs,
		...completeReportsSnapshot.docs,
	]);

	const progressReports = progressReportsSnapshot.docs.map((doc) =>
		serializeRiskAssessmentListItem(doc.id, doc.data(), nameById)
	);

	const completeReports = completeReportsSnapshot.docs.map((doc) =>
		serializeRiskAssessmentListItem(doc.id, doc.data(), nameById)
	);

	return { progressReports, completeReports };
}

async function resolveCreatorNames(
	docs: QueryDocumentSnapshot[]
): Promise<Map<string, string>> {
	const db = getFirestore();
	const creatorIds = [
		...new Set(
			docs
				.map((doc) => String(doc.data()?.createdBy ?? "").trim())
				.filter((id) => id.length > 0)
		),
	];

	const nameById = new Map<string, string>();
	await Promise.all(
		creatorIds.map(async (creatorId) => {
			try {
				const snap = await db.collection("app_users").doc(creatorId).get();
				const name = snap.exists ? String(snap.data()?.name ?? "").trim() : "";
				if (name.length > 0) {
					nameById.set(creatorId, name);
				}
			} catch {
				// Keep going — display name falls back to completedBy / id.
			}
		})
	);

	return nameById;
}

function serializeRiskAssessmentListItem(
	firebaseId: string,
	data: Record<string, any>,
	nameById: Map<string, string> = new Map()
) {
	const dateCreated = data.dateCreated?.toDate
		? data.dateCreated.toDate().toISOString()
		: data.dateCreated;
	const createdBy = String(data.createdBy ?? "").trim();

	return {
		firebaseId,
		riskAssessmentId: data.riskAssessmentId ?? "",
		name: data.name ?? "",
		simproId: data.simproId ?? "",
		address: data.address ?? "",
		customer: data.customer ?? "",
		status: data.status ?? "",
		dateCreated,
		createdBy,
		createdByDisplayName:
			data.createdByDisplayName ||
			data.completedBy ||
			nameById.get(createdBy) ||
			"",
		completedBy: data.completedBy ?? "",
	};
}
