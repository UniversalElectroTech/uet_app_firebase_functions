import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";
import { getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { VehicleLog } from "../../../models/vehicleLogModel";

// Returns all customers with RCD testings jobs from the SimproAPI
export async function returnVehicleLogHandler(request: CallableRequest) {
	try {
		// Check that the user is authenticated.
		if (!request.auth) {
			// Throwing an HttpsError so that the client gets the error details.
			throw new HttpsError(
				"failed-precondition",
				"The function must be " + "called while authenticated."
			);
		}

		const {
			vehicleLog,
		}: {
			vehicleLog: any;
		} = request.data;

		// Check if all required parameters have been received
		if (vehicleLog === undefined) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		// Assuming vehicleLog is an object containing the necessary properties
		const vehicleLogObj: VehicleLog = new VehicleLog({
			vehicle: null, // Assign vehicle
			vehicleFirebaseDocId: vehicleLog.vehicleFirebaseDocId, // Assign vehicleFirebaseDocId
			timestampOut: null,
			timestampIn: vehicleLog.timestampIn, // Assign timestampIn
			loggedBy: request.auth.uid, // Assign loggedBy
			description: vehicleLog.description, // Assign description
			firebaseDocId: vehicleLog.firebaseDocId, // Assign firebaseDocId
			returnedBy: request.auth.uid, // Assign returnedBy
		});

		return await returnVehicleLog(vehicleLogObj, request.auth.uid);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function returnVehicleLog(
	vehicleLog: VehicleLog,
	requestAuthUid: string
) {
	// Fetch the vehicle log document to verify ownership
	const docRef = getFirestore()
		.collection("vehicle_logs")
		.doc(vehicleLog.firebaseDocId!);
	const docSnap = await docRef.get();

	if (!docSnap.exists) {
		throw new HttpsError("not-found", "Vehicle log not found.");
	}

	const vehicleLogData = docSnap.data();

	// If admin returning employee vehicle
	if (vehicleLog.returnedBy != vehicleLogData!.loggedBy) {
		if (!(await isAdmin(requestAuthUid))) {
			throw new HttpsError(
				"failed-precondition",
				"User is not authenticated for this action."
			);
		}
		// If employee returning their own vehicle
	} else {
		// Ensure the loggedBy field matches the authenticated user
		if (vehicleLogData?.loggedBy != requestAuthUid) {
			throw new HttpsError(
				"permission-denied",
				"You can only update logs you created."
			);
		}
	}

	// Update the vehicle log document with the timestampIn and timestampInBy fields
	await docRef.update({
		timestampIn: vehicleLog.timestampIn,
		returnedBy: requestAuthUid,
	});

	return;
}
