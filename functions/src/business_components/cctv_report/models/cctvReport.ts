export class CctvReport {
	public firebaseId: string;
	public name: string;
	public address: string;
	public simproId: string;
	public status: string;
	public dateCreated: string;

	constructor({
		firebaseId,
		name,
		address,
		simproId,
		status,
		dateCreated,
	}: {
		firebaseId: string;
		name: string;
		address: string;
		simproId: string;
		status: string;
		dateCreated: string;
	}) {
		this.firebaseId = firebaseId;
		this.name = name;
		this.address = address;
		this.simproId = simproId;
		this.status = status;
		this.dateCreated = dateCreated;
	}

	// Method to convert the CctvReport to a Map for serialization
	toMap(): { [key: string]: any } {
		return {
			name: this.name,
			address: this.address,
			simproId: this.simproId,
			status: this.status,
			dateCreated: this.dateCreated,
		};
	}

	// Factory method to create a CctvReport from a Map
	static fromMap(map: { [key: string]: any }): CctvReport {
		return new CctvReport({
			firebaseId: map["firebaseId"],
			name: map["name"],
			address: map["address"],
			simproId: map["simproId"],
			status: map["status"],
			dateCreated: map["dateCreated"],
		});
	}

	// Method to create a copy of the CctvReport with modified properties
	copyWith({
		firebaseId,
		name,
		address,
		simproId,
		status,
		dateCreated,
	}: {
		firebaseId?: string;
		name?: string;
		address?: string;
		simproId?: string;
		status?: string;
		dateCreated?: string;
	}): CctvReport {
		return new CctvReport({
			firebaseId: firebaseId ?? this.firebaseId,
			name: name ?? this.name,
			address: address ?? this.address,
			simproId: simproId ?? this.simproId,
			status: status ?? this.status,
			dateCreated: dateCreated ?? this.dateCreated,
		});
	}
}
