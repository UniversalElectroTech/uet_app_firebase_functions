import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";

export async function deleteRiskAssessmentHandler(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	const { firebaseId }: { firebaseId: string } = request.data;

	if (!firebaseId) {
		throw new HttpsError(
			"failed-precondition",
			"Required parameters are missing."
		);
	}

	try {
		await deleteRiskAssessment(firebaseId, request.auth.uid);
		return {
			success: true,
			message: "Risk assessment deleted successfully.",
		};
	} catch (error) {
		return handleAxiosError(error);
	}
}

async function deleteRiskAssessment(firebaseId: string, userId: string) {
	const db = getFirestore();
	const reportRef = db.collection("risk_assessments").doc(firebaseId);
	const reportDoc = await reportRef.get();

	const userIsAdmin = await isAdmin(userId);
	const isOwner = reportDoc.exists && reportDoc.data()?.createdBy === userId;
	if (!reportDoc.exists || (!isOwner && !userIsAdmin)) {
		throw new HttpsError(
			"permission-denied",
			"You do not have permission to delete this risk assessment."
		);
	}

	const status = String(reportDoc.data()?.status ?? "").toLowerCase();
	const isCompleted =
		status === "complete" ||
		status === "completed" ||
		status === "submitted";

	// Completed assessments stay locked for owners; admins may delete them.
	if (isCompleted && !userIsAdmin) {
		throw new HttpsError(
			"failed-precondition",
			"Completed risk assessments are locked and cannot be deleted."
		);
	}

	await reportRef.delete();
}
