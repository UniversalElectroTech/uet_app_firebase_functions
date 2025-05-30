import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { getFirestore } from "firebase-admin/firestore";

export async function getCctvReportsHandler(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const userId = request.auth.uid;

		return getCctvReports(userId);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function getCctvReports(createdBy: string) {
	// Initialize Firestore
	const db = getFirestore();

	// Fetch progress reports from Firestore
	const progressReportsSnapshot = await db
		.collection("cctv_reports")
		.where("createdBy", "==", createdBy)
		.where("status", "==", "progress")
		.orderBy("dateCreated", "desc")
		.get();

	// Fetch complete reports from Firestore
	const completeReportsSnapshot = await db
		.collection("cctv_reports")
		.where("createdBy", "==", createdBy)
		.where("status", "==", "complete")
		.orderBy("dateCreated", "desc")
		.get();

	const progressReports: any[] = progressReportsSnapshot.docs.map((doc) => ({
		...doc.data(),
		firebaseId: doc.id, // Added firebaseId
	}));
	const completeReports: any[] = completeReportsSnapshot.docs.map((doc) => ({
		...doc.data(),
		firebaseId: doc.id, // Added firebaseId
	}));

	return { progressReports, completeReports }; // Return both lists
}
