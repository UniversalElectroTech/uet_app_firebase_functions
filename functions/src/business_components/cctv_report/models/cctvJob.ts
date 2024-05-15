export class CctvJob {
	public name: string;
	public simproId: string;
	public stage: string;

	constructor({
		name,
		simproId,
		stage,
	}: {
		name: string;
		simproId: string;
		stage: string;
	}) {
		this.name = name;
		this.simproId = simproId;
		this.stage = stage;
	}

	static fromMap(map: { [key: string]: any }): CctvJob {
		return new CctvJob({
			name: map["Name"] as string,
			simproId: map["ID"].toString(),
			stage: map["Stage"] as string,
		});
	}

	toMap(): any {
		return { name: this.name, simproId: this.simproId, stage: this.stage };
	}

	copyWith({
		name,
		simproId,
		stage,
	}: {
		name?: string;
		simproId?: string;
		stage?: string;
	}): CctvJob {
		return new CctvJob({
			name: name ?? this.name,
			simproId: simproId ?? this.simproId,
			stage: stage ?? this.stage,
		});
	}

	static empty(): CctvJob {
		return new CctvJob({
			name: "",
			simproId: "",
			stage: "",
		});
	}
}
