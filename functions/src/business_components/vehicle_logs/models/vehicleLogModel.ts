import { Vehicle } from "./vehicleModel"; // Ensure you import the Vehicle model

/**
 * Represents a log entry for a vehicle, including details about the vehicle,
 * timestamps for when the vehicle was checked in and out, and the user who logged the entry.
 */
export class VehicleLog {
	vehicle?: Vehicle | null; // Vehicle instance (optional)
	vehicleFirebaseDocId?: string | null; // Vehicle document ID (optional)
	timestampOut?: string | null; // Timestamp for when the vehicle was checked out (optional)
	timestampIn?: string | null; // Timestamp for when the vehicle was checked in (optional)
	loggedBy?: string | null; // Employee Firebase UID (optional)
	description?: string | null; // Description of the log entry (optional)
	firebaseDocId?: string | null; // Firebase document ID (optional)
	returnedBy?: string | null; // Employee Firebase UID for who returned the vehicle (optional)

	constructor({
		vehicle = null,
		vehicleFirebaseDocId = null,
		timestampOut = null,
		timestampIn = null,
		loggedBy = null,
		description = null,
		firebaseDocId = null,
		returnedBy = null,
	}: {
		vehicle?: Vehicle | null;
		vehicleFirebaseDocId?: string | null;
		timestampOut?: string | null;
		timestampIn?: string | null;
		loggedBy?: string | null;
		description?: string | null;
		firebaseDocId?: string | null;
		returnedBy?: string | null;
	}) {
		this.vehicle = vehicle;
		this.vehicleFirebaseDocId = vehicleFirebaseDocId;
		this.timestampOut = timestampOut;
		this.timestampIn = timestampIn;
		this.loggedBy = loggedBy;
		this.description = description;
		this.firebaseDocId = firebaseDocId;
		this.returnedBy = returnedBy;
	}

	/**
	 * Factory method to create a VehicleLog from a Firestore document.
	 */
	static fromFirebaseMap(json: any): VehicleLog {
		return new VehicleLog({
			vehicle: json.vehicle ? Vehicle.fromFirebaseMap(json.vehicle) : null, // Create Vehicle instance or null
			vehicleFirebaseDocId: json.vehicleFirebaseDocId || null, // Set to null if VehicleId is not present
			timestampOut: json.timestampOut || null, // Set to null if TimestampOut is not present
			timestampIn: json.timestampIn || null, // Set to null if TimestampIn is not present
			loggedBy: json.loggedBy || null, // Set to null if LoggedBy is not present
			description: json.description || null, // Set to null if Description is not present
			firebaseDocId: json.docId || null, // Set to null if docId is not present
			returnedBy: json.returnedBy || null, // Set to null if returnedBy is not present
		});
	}

	/**
	 * Converts the VehicleLog object to a format compatible with Firestore.
	 */
	toFirebaseMap(): Record<string, any> {
		return {
			vehicleFirebaseDocId: this.vehicleFirebaseDocId || null, // Include vehicleFirebaseDocId in the output
			timestampOut: this.timestampOut || null, // Convert to ISO string if present
			timestampIn: this.timestampIn || null, // Convert to ISO string if present
			loggedBy: this.loggedBy || null, // Include loggedBy in the output
			description: this.description || null, // Include description in the output
			returnedBy: this.returnedBy || null, // Include returnedBy in the output
		};
	}
}
