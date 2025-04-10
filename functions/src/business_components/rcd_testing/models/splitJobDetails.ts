export class SplitJobDetails {
	constructor(public firebaseDocId: string | null, public simproId: string) {}

	static empty = new SplitJobDetails(null, "");

	toFirebaseMap(): any {
		return {
			firebaseDocId: this.firebaseDocId,
			simproId: this.simproId,
		};
	}

	static fromFirebaseMap(map: any): SplitJobDetails {
		return new SplitJobDetails(map["firebaseDocId"], map["simproId"]);
	}

	toFrontEndMap(): any {
		return {
			simproId: this.simproId,
		};
	}

	copyWith({
		firebaseDocId = this.firebaseDocId,
		simproId = this.simproId,
	}: {
		firebaseDocId?: string | null;
		simproId?: string;
	}): SplitJobDetails {
		return new SplitJobDetails(firebaseDocId, simproId);
	}
}
