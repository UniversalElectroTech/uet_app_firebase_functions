import { Timestamp } from "firebase-admin/firestore";

export class Note {
	constructor(
		public id: string,
		public createdByFirebaseId: string,
		public createdByName: string,
		public dateCreated: Timestamp,
		public note: string,
		public isImportant: boolean
	) {}

	static fromMap(map: any): Note {
		return new Note(
			map["id"] ?? "",
			map["createdByFirebaseId"],
			map["createdByName"],
			map["dateCreated"],
			map["note"] ?? "",
			map["isImportant"] ?? false
		);
	}

	toFirebaseMap(): any {
		return {
			id: this.id,
			createdByFirebaseId: this.createdByFirebaseId,
			createdByName: this.createdByName,
			dateCreated: this.dateCreated,
			note: this.note,
			isImportant: this.isImportant,
		};
	}

	toFrontEndMap(): any {
		return {
			id: this.id,
			createdBy: this.createdByName,
			date: this.dateCreated,
			note: this.note,
			isImportant: this.isImportant,
		};
	}

	copyWith(
		id?: string,
		createdByFirebaseId?: string,
		createdByName?: string,
		dateCreated?: Timestamp,
		note?: string,
		isImportant?: boolean
	): Note {
		return new Note(
			id ?? this.id,
			createdByFirebaseId ?? this.createdByFirebaseId,
			createdByName ?? this.createdByName,
			dateCreated ?? this.dateCreated,
			note ?? this.note,
			isImportant ?? this.isImportant
		);
	}
}
