// src/business_components/cctv_report/models/CctvNote.ts
export class CctvNote {
	public id: string;
	public note: string;

	constructor({ id, note }: { id: string; note: string }) {
		this.id = id;
		this.note = note;
	}

	static fromFirebaseMap(map: { [key: string]: any }): CctvNote {
		return new CctvNote({
			id: map["id"],
			note: map["note"],
		});
	}

	toMap(): { [key: string]: any } {
		return {
			id: this.id,
			note: this.note,
		};
	}

	copyWith({
		id,
		note,
		errorMessage,
	}: {
		id?: string;
		note?: string;
		errorMessage?: string;
	}): CctvNote {
		return new CctvNote({
			id: id ?? this.id,
			note: note ?? this.note,
		});
	}

	static empty = new CctvNote({
		id: "",
		note: "",
	});
}
