import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { VehicleLog } from "../../../models/vehicleLogModel";

// Returns all customers with RCD testings jobs from the SimproAPI
export async function addVehicleLogHandler(request: CallableRequest) {
	try {
		// Check that the user is authenticated.
		if (!request.auth) {
			// Throwing an HttpsError so that the client gets the error details.
			throw new HttpsError(
				"failed-precondition",
				"The function must be " + "called while authenticated."
			);
		}

		const { vehicleLog }: { vehicleLog: any } = request.data;

		// Check if all required parameters have been received
		if (vehicleLog === undefined) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		// Check if all required parameters have been received
		if (!vehicleLog) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		// Assuming vehicleLog is an object containing the necessary properties
		const vehicleLogObj: VehicleLog = new VehicleLog({
			vehicle: null, // Assign vehicle
			vehicleFirebaseDocId: vehicleLog.vehicleFirebaseDocId, // Assign vehicleFirebaseDocId
			timestampOut: vehicleLog.timestampOut, // Assign timestampOut
			timestampIn: null, // Assign timestampIn
			loggedBy: request.auth.uid, // Assign loggedBy
			description: vehicleLog.description, // Assign description
		});

		return await addVehicleLog(vehicleLogObj);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function addVehicleLog(vehicleLog: VehicleLog) {
	const vehicleLogData = vehicleLog.toFirebaseMap();

	await getFirestore().collection("vehicle_logs").add(vehicleLogData);

	return;
}
