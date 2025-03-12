import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";
import { getFirestore } from "firebase-admin/firestore";
import { Vehicle } from "../../../models/vehicleModel";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";

// Returns all customers with RCD testings jobs from the SimproAPI
export async function addVehicleHandler(request: CallableRequest) {
	try {
		// Check that the user is authenticated.
		if (!request.auth) {
			throw new HttpsError(
				"failed-precondition",
				"The function must be called while authenticated."
			);
		}

		if (!(await isAdmin(request.auth.uid))) {
			throw new HttpsError(
				"failed-precondition",
				"User is not authenticated for this action."
			);
		}

		const { vehicle }: { vehicle: any } = request.data; // Change to vehicleData

		// Check if all required parameters have been received
		if (!vehicle) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		// Create a new Vehicle instance
		const vehicleObj: Vehicle = new Vehicle(
			vehicle.ownedBy,
			vehicle.name,
			vehicle.rego,
			vehicle.carDescription,
			vehicle.assetNumber
		);

		return await addVehicle(vehicleObj);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function addVehicle(vehicle: Vehicle) {
	const vehicleData = vehicle.toFirebaseMap();
	await getFirestore().collection("vehicles").add(vehicleData);

	return;
}
