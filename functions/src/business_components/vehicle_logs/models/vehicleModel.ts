/**
 * Represents a vehicle with details about ownership and identification.
 */
export class Vehicle {
	ownedBy?: string; // Employee Firebase UID (optional)
	name?: string; // Optional property
	rego?: string; // Optional property
	carDescription?: string; // Optional property
	assetNumber?: string; // Optional property
	firebaseDocId?: string; // Firebase document ID (optional)

	constructor(
		ownedBy?: string, // Optional parameter
		name?: string, // Optional parameter
		rego?: string, // Optional parameter
		carDescription?: string, // Optional parameter
		assetNumber?: string, // Optional parameter
		firebaseDocId?: string // Optional parameter
	) {
		this.ownedBy = ownedBy;
		this.name = name;
		this.rego = rego;
		this.carDescription = carDescription;
		this.assetNumber = assetNumber;
		this.firebaseDocId = firebaseDocId;
	}

	/**
	 * Factory method to create a Vehicle from a Firestore document.
	 */
	static fromFirebaseMap(json: any): Vehicle {
		return new Vehicle(
			json.ownedBy || null, // Set to null if not present
			json.name || null, // Set to null if not present
			json.rego || null, // Set to null if not present
			json.carDescription || null, // Set to null if not present
			json.assetNumber || null, // Set to null if not present
			json.docId || null // Set to null if not present
		);
	}

	/**
	 * Converts the Vehicle object to a format compatible with Firestore.
	 */
	toFirebaseMap(): Record<string, any> {
		return {
			ownedBy: this.ownedBy || null, // Include as null if not set
			name: this.name || null, // Include as null if not set
			rego: this.rego || null, // Include as null if not set
			carDescription: this.carDescription || null, // Include as null if not set
			assetNumber: this.assetNumber || null, // Include as null if not set
			// 'firebaseDocId' is not included in the output as per original logic
		};
	}
}
