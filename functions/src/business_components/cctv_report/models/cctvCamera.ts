// src/business_components/cctv_report/models/CctvCamera.ts
export class CctvCamera {
	public id: string;
	public channel: string;
	public serialNumber: string;
	public ipAddress: string;
	public location: string;
	public modelNumber: string;

	constructor({
		id,
		channel,
		serialNumber,
		ipAddress,
		location,
		modelNumber,
	}: {
		id: string;
		channel: string;
		serialNumber: string;
		ipAddress: string;
		location: string;
		modelNumber: string;
	}) {
		this.id = id;
		this.channel = channel;
		this.serialNumber = serialNumber;
		this.ipAddress = ipAddress;
		this.location = location;
		this.modelNumber = modelNumber;
	}

	static fromFirebaseMap(map: { [key: string]: any }): CctvCamera {
		return new CctvCamera({
			id: map["id"],
			channel: map["channel"],
			serialNumber: map["serialNumber"],
			ipAddress: map["ipAddress"],
			location: map["location"],
			modelNumber: map["modelNumber"],
		});
	}

	toMap(): { [key: string]: any } {
		return {
			id: this.id,
			channel: this.channel,
			serialNumber: this.serialNumber,
			ipAddress: this.ipAddress,
			location: this.location,
			modelNumber: this.modelNumber,
		};
	}

	copyWith({
		id,
		channel,
		serialNumber,
		ipAddress,
		location,
		modelNumber,
	}: {
		id?: string;
		channel?: string;
		serialNumber?: string;
		ipAddress?: string;
		location?: string;
		modelNumber?: string;
	}): CctvCamera {
		return new CctvCamera({
			id: id ?? this.id,
			channel: channel ?? this.channel,
			serialNumber: serialNumber ?? this.serialNumber,
			ipAddress: ipAddress ?? this.ipAddress,
			location: location ?? this.location,
			modelNumber: modelNumber ?? this.modelNumber,
		});
	}

	static empty = new CctvCamera({
		id: "",
		channel: "",
		serialNumber: "",
		ipAddress: "",
		location: "",
		modelNumber: "",
	});
}
