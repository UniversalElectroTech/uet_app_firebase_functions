export class LatLng {
	latitude: number;
	longitude: number;

	constructor(latitude: number, longitude: number) {
		this.latitude = latitude;
		this.longitude = longitude;
	}

	static fromFirebaseMap(data: any): LatLng {
		const latitude = data[0];
		const longitude = data[1];
		return new LatLng(latitude, longitude);
	}
}
