import { Rcd } from "./rcd";

export enum TestType {
	PushButton = "pushButton",
	Injection = "injection",
}

export class DistributionBoard {
	constructor(
		public name: string,
		public images: string[],
		public rcds: Rcd[],
		public notes: string,
		public testType: TestType = TestType.PushButton,
		public firebaseDocId?: string,
		public orderId?: number
	) {}

	static empty = new DistributionBoard(
		"",
		[],
		[],
		"",
		TestType.PushButton,
		undefined,
		undefined
	);

	static fromMap(dbData: any): DistributionBoard {
		const rcds = (dbData["rcds"] as any[]).map((data) =>
			Rcd.fromFirebaseMap(data)
		);
		return new DistributionBoard(
			dbData["name"],
			dbData["images"] || [],
			rcds,
			dbData["notes"],
			dbData["testType"] || TestType.PushButton,
			dbData["firebaseDocId"],
			dbData["orderId"]
		);
	}

	toFirebaseMap(): any {
		return {
			firebaseDocId: this.firebaseDocId,
			orderId: this.orderId,
			name: this.name,
			notes: this.notes,
			images: this.images,
			testType: this.testType,
		};
	}

	copyWith(
		firebaseDocId?: string,
		name?: string,
		images?: string[],
		rcds?: Rcd[],
		notes?: string,
		orderId?: number,
		testType?: TestType
	): DistributionBoard {
		return new DistributionBoard(
			name ?? this.name,
			images ?? this.images,
			rcds ?? this.rcds,
			notes ?? this.notes,
			testType ?? this.testType,
			firebaseDocId ?? this.firebaseDocId,
			orderId ?? this.orderId
		);
	}
}
