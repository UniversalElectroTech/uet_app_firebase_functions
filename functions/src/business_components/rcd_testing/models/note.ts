interface Note {
	id: string;
	createdByFirebaseId: string;
	createdByName: string;
	dateCreated: string; // Assuming ISO 8601 string format
	note: string;
	isImportant: boolean;
}
