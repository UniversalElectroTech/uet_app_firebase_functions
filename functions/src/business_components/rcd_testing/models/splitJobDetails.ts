export class SplitJobDetails {
	public firebaseDocId: string | null;
	public simproId: string;

	constructor({
		firebaseDocId,
		simproId,
	}: {
		firebaseDocId: string | null;
		simproId: string;
	}) {
		this.firebaseDocId = firebaseDocId;
		this.simproId = simproId;
	}

	static fromFirebaseMap(map: { [key: string]: any }): SplitJobDetails {
		return new SplitJobDetails({
			firebaseDocId: map["firebaseDocId"],
			simproId: map["simproId"],
		});
	}
}
