import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";
import { VehicleLog } from "../../../models/vehicleLogModel";
import { Vehicle } from "../../../models/vehicleModel";

export async function getEmployeeVehicleLogsHandler(request: CallableRequest) {
	try {
		// Check that the user is authenticated.
		if (!request.auth) {
			// Throwing an HttpsError so that the client gets the error details.
			throw new HttpsError(
				"failed-precondition",
				"The function must be " + "called while authenticated."
			);
		}

		const { employeeFirebaseId }: { employeeFirebaseId: string | null } =
			request.data;

		return await getEmployeeVehicleLogs(request.auth.uid, employeeFirebaseId);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function getEmployeeVehicleLogs(
	firebaseUserID: string,
	employeeFirebaseId: string | null
) {
	let employeeVehicleLogs;
	if (employeeFirebaseId != null) {
		if (!(await isAdmin(firebaseUserID))) {
			throw new HttpsError(
				"failed-precondition",
				"User is not authenticated for this action."
			);
		}
		employeeVehicleLogs = await getAllVehicleLogsWithVehicles(
			employeeFirebaseId!
		);
	} else {
		employeeVehicleLogs = await getAllVehicleLogsWithVehicles(firebaseUserID!);
	}

	return employeeVehicleLogs;
}

async function getAllVehicleLogsWithVehicles(employeeFirebaseId: string) {
	const docSnap = await getFirestore()
		.collection("vehicle_logs")
		.where("loggedBy", "==", employeeFirebaseId) // Filter by employeeId
		.get();

	// Create an array to hold the vehicle logs with their corresponding vehicle details
	const vehicleLogsWithDetails = await Promise.all(
		docSnap.docs.map(async (doc) => {
			const vehicleLogData = VehicleLog.fromFirebaseMap({
				...doc.data(),
				docId: doc.id,
			});
			const vehicleId = vehicleLogData.vehicleFirebaseDocId;

			if (vehicleId) {
				// Fetch the vehicle details based on vehicleId
				const vehicleDoc = await getFirestore()
					.collection("vehicles")
					.doc(vehicleId)
					.get();
				if (vehicleDoc.exists) {
					vehicleLogData.vehicle = Vehicle.fromFirebaseMap(vehicleDoc.data()); // Add vehicle details to the log
				} else {
					// Throw an error if the vehicle is not found
					throw new HttpsError(
						"not-found",
						`Vehicle with ID ${vehicleId} not found for vehicle log ${vehicleLogData.firebaseDocId}.`
					);
				}
			} else {
				// Throw an error if vehicleId is missing
				throw new HttpsError(
					"invalid-argument",
					`Vehicle ID is missing for vehicle log ${vehicleLogData.firebaseDocId}.`
				);
			}

			return vehicleLogData; // Return the log with vehicle details
		})
	);

	return vehicleLogsWithDetails; // Return the array of vehicle logs with vehicle details
}
