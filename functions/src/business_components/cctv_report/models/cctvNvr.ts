// src/business_components/cctv_report/models/CctvNvr.ts
export class CctvNvr {
	public id: string;
	public serialNumber: string;
	public ipAddress: string;
	public location: string;
	public modelNumber: string;

	constructor({
		id,
		serialNumber,
		ipAddress,
		location,
		modelNumber,
	}: {
		id: string;
		serialNumber: string;
		ipAddress: string;
		location: string;
		modelNumber: string;
	}) {
		this.id = id;
		this.serialNumber = serialNumber;
		this.ipAddress = ipAddress;
		this.location = location;
		this.modelNumber = modelNumber;
	}

	static fromFirebaseMap(map: { [key: string]: any }): CctvNvr {
		return new CctvNvr({
			id: map["id"],
			serialNumber: map["serialNumber"],
			ipAddress: map["ipAddress"],
			location: map["location"],
			modelNumber: map["modelNumber"],
		});
	}

	toMap(): { [key: string]: any } {
		return {
			id: this.id,
			serialNumber: this.serialNumber,
			ipAddress: this.ipAddress,
			location: this.location,
			modelNumber: this.modelNumber,
		};
	}

	copyWith({
		id,
		serialNumber,
		ipAddress,
		location,
		modelNumber,
	}: {
		id?: string;
		serialNumber?: string;
		ipAddress?: string;
		location?: string;
		modelNumber?: string;
		errorMessage?: string;
	}): CctvNvr {
		return new CctvNvr({
			id: id ?? this.id,
			serialNumber: serialNumber ?? this.serialNumber,
			ipAddress: ipAddress ?? this.ipAddress,
			location: location ?? this.location,
			modelNumber: modelNumber ?? this.modelNumber,
		});
	}

	static empty = new CctvNvr({
		id: "",
		serialNumber: "",
		ipAddress: "",
		location: "",
		modelNumber: "",
	});
}
