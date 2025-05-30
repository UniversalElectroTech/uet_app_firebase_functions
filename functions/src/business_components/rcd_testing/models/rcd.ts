export class Rcd {
	constructor(
		public firebaseDocId: string,
		public name: string,
		public note: string = "",
		public isPassed: boolean,
		public isTestable: boolean = true,
		public orderId?: number,
		public tripCurrent?: number,
		public tripTime?: number
	) {}

	static fromFirebaseMap(map: any): Rcd {
		return new Rcd(
			map["firebaseDocId"],
			map["name"],
			map["note"],
			map["passed"] ?? false,
			map["isTestable"] ?? true,
			map["orderId"],
			map["tripCurrent"] ? parseFloat(map["tripCurrent"]) : undefined,
			map["tripTime"] ? parseFloat(map["tripTime"]) : undefined
		);
	}

	toFirebaseMap(): any {
		return {
			firebaseDocId: this.firebaseDocId,
			name: this.name,
			note: this.note,
			passed: this.isPassed,
			isTestable: this.isTestable,
			orderId: this.orderId,
			tripCurrent: this.tripCurrent,
			tripTime: this.tripTime,
		};
	}

	copyWith(
		firebaseDocId?: string,
		name?: string,
		note?: string,
		passed?: boolean,
		isTestable?: boolean,
		orderId?: number,
		tripCurrent?: number,
		tripTime?: number
	): Rcd {
		return new Rcd(
			firebaseDocId ?? this.firebaseDocId,
			name ?? this.name,
			note ?? this.note,
			passed ?? this.isPassed,
			isTestable ?? this.isTestable,
			orderId ?? this.orderId,
			tripCurrent ?? this.tripCurrent,
			tripTime ?? this.tripTime
		);
	}
}
