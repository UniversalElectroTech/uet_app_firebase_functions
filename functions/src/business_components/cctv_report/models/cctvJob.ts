import { CctvCamera } from "./cctvCamera";
import { CctvLogin } from "./cctvLogin";
import { CctvNote } from "./cctvNote";
import { CctvNvr } from "./cctvNvr";

export class CctvJob {
	public firebaseId?: string; // Added firebaseId
	public dateCreated?: Date;
	public createdBy?: string;
	public name?: string;
	public address?: string; // Made address optional
	public simproId?: string;
	public status?: string; // Changed stage to status
	public cameras?: CctvCamera[]; // Added cameras
	public nvrs?: CctvNvr[]; // Added nvrs
	public logins?: CctvLogin[]; // Added logins
	public notes?: CctvNote[]; // Added notes

	constructor({
		firebaseId, // Added firebaseId
		dateCreated,
		createdBy,
		name,
		address, // Added address
		simproId,
		status, // Changed stage to status
		cameras = [], // Added default value for cameras
		nvrs = [], // Added default value for nvrs
		logins = [], // Added default value for logins
		notes = [], // Added default value for notes
	}: {
		firebaseId?: string; // Added firebaseId type
		dateCreated?: Date;
		createdBy?: string;
		name?: string;
		address?: string; // Made address optional
		simproId?: string;
		status?: string; // Changed stage to status
		cameras?: CctvCamera[]; // Added cameras type
		nvrs?: CctvNvr[]; // Added nvrs type
		logins?: CctvLogin[]; // Added logins type
		notes?: CctvNote[]; // Added notes type
	}) {
		this.firebaseId = firebaseId; // Added firebaseId assignment
		this.dateCreated = dateCreated;
		this.createdBy = createdBy;
		this.name = name;
		this.address = address; // Added address assignment
		this.simproId = simproId;
		this.status = status; // Changed stage assignment to status
		this.cameras = cameras; // Added cameras assignment
		this.nvrs = nvrs; // Added nvrs assignment
		this.logins = logins; // Added logins assignment
		this.notes = notes; // Added notes assignment
	}

	static fromSimproMap(map: { [key: string]: any }): CctvJob {
		const name = map["Name"] as string;
		const address = map["Site"]["Address"]["Address"];
		const simproId = map["ID"] as string;

		const city = map["Site"]["Address"]["City"];
		const state = map["Site"]["Address"]["State"];
		const postCode = map["Site"]["Address"]["PostalCode"];
		const completeAddress = `${address}, ${city} ${state} ${postCode}`; // Construct complete address

		return new CctvJob({
			name: name,
			address: completeAddress,
			simproId,
		});
	}

	static fromMap(map: { [key: string]: any }): CctvJob {
		const firebaseId = (map["firebaseId"] as string) ?? "";
		const createdBy = map["createdBy"] as string;
		const name = map["name"] as string;
		const address = map["address"] as string;
		const simproId = map["simproId"] as string;
		const status = map["status"] as string;
		const dateCreated = map["dateCreated"] as Date;
		const cameras: CctvCamera[] = (map["cameras"] as any[]).map((cameraData) =>
			CctvCamera.fromFirebaseMap(cameraData)
		);
		const nvrs: CctvNvr[] = (map["nvrs"] as any[]).map((nvrData) =>
			CctvNvr.fromFirebaseMap(nvrData)
		);
		const logins: CctvLogin[] = (map["logins"] as any[]).map((loginData) =>
			CctvLogin.fromFirebaseMap(loginData)
		);
		const notes: CctvNote[] = (map["notes"] as any[]).map((noteData) =>
			CctvNote.fromFirebaseMap(noteData)
		);

		return new CctvJob({
			firebaseId: firebaseId,
			dateCreated: dateCreated,
			createdBy: createdBy,
			name: name,
			address: address,
			simproId: simproId,
			status: status,
			cameras: cameras,
			nvrs: nvrs,
			logins: logins,
			notes: notes,
		});
	}

	toFirebaseUpdateMap(): any {
		return {
			name: this.name,
			address: this.address,
			simproId: this.simproId,
			cameras: this.cameras?.map((camera) => camera.toMap()) ?? [], // Map cameras
			nvrs: this.nvrs?.map((nvr) => nvr.toMap()) ?? [], // Map nvrs
			logins: this.logins?.map((login) => login.toMap()) ?? [], // Map logins
			notes: this.notes?.map((note) => note.toMap()) ?? [], // Map notes
		};
	}

	toFirebaseMap(): any {
		return {
			dateCreated: this.dateCreated,
			createdBy: this.createdBy,
			name: this.name,
			address: this.address, // Added address to map
			simproId: this.simproId,
			status: this.status, // Changed stage to status in map
			cameras: this.cameras?.map((camera) => camera.toMap()) ?? [], // Map cameras
			nvrs: this.nvrs?.map((nvr) => nvr.toMap()) ?? [], // Map nvrs
			logins: this.logins?.map((login) => login.toMap()) ?? [], // Map logins
			notes: this.notes?.map((note) => note.toMap()) ?? [], // Map notes
		};
	}

	toFrontendMap(): any {
		return {
			firebaseId: this.firebaseId,
			dateCreated: this.dateCreated,
			createdBy: this.createdBy,
			name: this.name,
			address: this.address, // Added address to map
			simproId: this.simproId,
			status: this.status, // Changed stage to status in map
			cameras: this.cameras?.map((camera) => camera.toMap()) ?? [], // Map cameras
			nvrs: this.nvrs?.map((nvr) => nvr.toMap()) ?? [], // Map nvrs
			logins: this.logins?.map((login) => login.toMap()) ?? [], // Map logins
			notes: this.notes?.map((note) => note.toMap()) ?? [], // Map notes
		};
	}

	copyWith({
		firebaseId,
		dateCreated,
		createdBy,
		name,
		address,
		simproId,
		status,
		cameras,
		nvrs,
		logins,
		notes,
	}: {
		firebaseId?: string; // Added firebaseId optional
		dateCreated?: Date;
		createdBy?: string;
		name?: string;
		address?: string; // Made address optional
		simproId?: string;
		status?: string; // Changed stage to status
		cameras?: CctvCamera[]; // Added cameras optional
		nvrs?: CctvNvr[]; // Added nvrs optional
		logins?: CctvLogin[]; // Added logins optional
		notes?: CctvNote[]; // Added notes optional
	}): CctvJob {
		return new CctvJob({
			firebaseId: firebaseId ?? this.firebaseId, // Added firebaseId handling
			dateCreated: dateCreated ?? this.dateCreated,
			createdBy: createdBy ?? this.createdBy,
			name: name ?? this.name,
			address: address ?? this.address, // Added address handling
			simproId: simproId ?? this.simproId,
			status: status ?? this.status, // Changed stage to status handling
			cameras: cameras ?? this.cameras, // Added cameras handling
			nvrs: nvrs ?? this.nvrs, // Added nvrs handling
			logins: logins ?? this.logins, // Added logins handling
			notes: notes ?? this.notes, // Added notes handling
		});
	}

	static empty(): CctvJob {
		return new CctvJob({
			firebaseId: "", // Added firebaseId to empty
			dateCreated: undefined,
			createdBy: "",
			name: "",
			address: "", // Added address to empty
			simproId: "",
			status: "", // Changed stage to status in empty
			cameras: [], // Added empty cameras
			nvrs: [], // Added empty nvrs
			logins: [], // Added empty logins
			notes: [], // Added empty notes
		});
	}
}
