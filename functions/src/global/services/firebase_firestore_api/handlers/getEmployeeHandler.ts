import { DocumentSnapshot, getFirestore } from "firebase-admin/firestore";
import { Employee } from "../../../models/employee";
import { handleAxiosError } from "../../helper_functions/errorHandling";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";

export async function getEmployeeHandler(request: CallableRequest) {
	try {
		// Check that the user is authenticated.
		if (!request.auth) {
			// Throwing an HttpsError so that the client gets the error details.
			throw new HttpsError(
				"failed-precondition",
				"The function must be " + "called while authenticated."
			);
		}

		const employeeFirebaseDocId = request.auth.uid;

		return await getEmployeeFromFirebase(employeeFirebaseDocId);
	} catch (error) {
		return handleAxiosError(error);
	}
}

export async function getEmployeeFromFirebase(employeeFirebaseDocId: string) {
	const db = getFirestore();

	const docSnapshot: DocumentSnapshot = await db
		.collection("app_users")
		.doc(employeeFirebaseDocId)
		.get();

	if (docSnapshot.exists) {
		const employeeData = {
			...docSnapshot.data(),
			firebaseDocId: docSnapshot.id,
		} as { [key: string]: any }; // Type assertion for the data

		const employee = Employee.fromFirebaseMap(employeeData);
		return employee;
	} else {
		// Employee not found
		return null;
	}
}
