import { Site } from "./site";
import { Note } from "./note";
import { Booking } from "./booking";
import { SplitJobDetails } from "./splitJobDetails";
import { Timestamp } from "firebase-admin/firestore";

export class Job {
	constructor(
		public firebaseDocId: string,
		public simproId: string,
		public name: string,
		public customerId: string,
		public customer: string,
		public site: Site | null,
		public jobComplete: boolean,
		public testCompleteDate: Timestamp | null,
		public notes: Note[],
		public bookings: Booking[],
		public stage: string,
		public testGroup: string,
		public isSplitJob: boolean,
		public isSplitJobParent: boolean,
		public splitJobDetails: SplitJobDetails | null,
		public geocode: { latitude: number; longitude: number } | null
	) {}

	// ... existing code ...
	static fromSimproMap(jobData: any, siteData: any): Job {
		const notes = (jobData["notes"] || []).map((noteMap: any) =>
			Note.fromMap(noteMap)
		);
		const bookings: Booking[] = []; // Assuming bookings are not provided in jobData

		// Extract testing group value from custom fields
		let testGroup: string = "";
		const customFields = jobData["CustomFields"] || [];
		const customField = customFields.find(
			(field: any) => field["CustomField"]["Name"] === "RCD Test Group"
		);
		if (customField) {
			const value = parseInt(customField["Value"], 10);
			testGroup = isNaN(value) ? "" : value.toString();
		}

		return new Job(
			jobData["firebaseDocId"],
			jobData["ID"].toString(),
			jobData["Name"].toString(),
			jobData["Customer"]["ID"].toString(),
			jobData["Customer"]["CompanyName"].toString(),
			Site.fromMap(siteData),
			jobData["jobComplete"] || false,
			jobData["testCompleteDate"],
			notes,
			bookings,
			jobData["Stage"].toString(),
			testGroup,
			false,
			false,
			null,
			null
		);
	}

	addFromFirebaseMap(map: any): Job {
		const notes = (map["notes"] || []).map((noteMap: any) =>
			Note.fromMap(noteMap)
		);
		const bookings = (map["bookings"] || []).map((bookingMap: any) =>
			Booking.fromFirebaseMap(bookingMap)
		);

		this.firebaseDocId = map["firebaseDocId"];
		this.simproId = map["simproId"].toString();
		this.jobComplete = map["jobComplete"];
		(this.testCompleteDate = map["testCompleteDate"]), (this.notes = notes);
		this.bookings = bookings;
		this.isSplitJob = map["isSplitJob"];
		this.isSplitJobParent = map["isSplitJobParent"];
		this.splitJobDetails = map["splitJobDetails"]
			? SplitJobDetails.fromFirebaseMap(map["splitJobDetails"])
			: null;

		// Additional fields can be added here as needed
		return this;
	}

	static fromFirebaseMap(map: any): Job {
		const notes = (map["notes"] || []).map((noteMap: any) =>
			Note.fromMap(noteMap)
		);
		const bookings = (map["bookings"] || []).map((bookingMap: any) =>
			Booking.fromFirebaseMap(bookingMap)
		);
		return new Job(
			map["firebaseDocId"],
			map["simproId"].toString(),
			"",
			"",
			"",
			Site.empty,
			map["jobComplete"],
			map["testCompleteDate"] ? map["testCompleteDate"] : null,
			notes,
			bookings,
			"",
			"",
			map["isSplitJob"],
			map["isSplitJobParent"],
			map["splitJobDetails"]
				? SplitJobDetails.fromFirebaseMap(map["splitJobDetails"])
				: null,
			null
		);
	}

	toFirebaseMap(): any {
		return {
			simproId: this.simproId,
			jobComplete: this.jobComplete,
			testCompleteDate: this.testCompleteDate,
			notes: this.notes.map((note) => note.toFirebaseMap()),
			bookings: this.bookings.map((booking) => booking.toFirebaseMap()),
			isSplitJob: this.isSplitJob,
			isSplitJobParent: this.isSplitJobParent,
			splitJobDetails: this.splitJobDetails
				? this.splitJobDetails.toFirebaseMap()
				: null,
		};
	}

	copyWith(updates: {
		firebaseDocId?: string;
		simproId?: string;
		name?: string;
		customerId?: string;
		customer?: string;
		site?: Site;
		jobComplete?: boolean;
		testCompleteDate?: Timestamp | null;
		notes?: Note[];
		bookings?: Booking[];
		stage?: string;
		testGroup?: string;
		isSplitJob?: boolean;
		isSplitJobParent?: boolean;
		splitJobDetails?: SplitJobDetails | null;
		geocode?: { latitude: number; longitude: number } | null;
	}): Job {
		return new Job(
			updates.firebaseDocId ?? this.firebaseDocId,
			updates.simproId ?? this.simproId,
			updates.name ?? this.name,
			updates.customerId ?? this.customerId,
			updates.customer ?? this.customer,
			updates.site ?? this.site,
			updates.jobComplete ?? this.jobComplete,
			updates.testCompleteDate ?? this.testCompleteDate,
			updates.notes ?? this.notes,
			updates.bookings ?? this.bookings,
			updates.stage ?? this.stage,
			updates.testGroup ?? this.testGroup,
			updates.isSplitJob ?? this.isSplitJob,
			updates.isSplitJobParent ?? this.isSplitJobParent,
			updates.splitJobDetails ?? this.splitJobDetails,
			updates.geocode ?? this.geocode
		);
	}

	toFrontEndMap(): any {
		// Change return type to string
		return {
			firebaseDocId: this.firebaseDocId,
			simproId: this.simproId,
			name: this.name,
			customerId: this.customerId,
			customer: this.customer,
			site: this.site?.toFrontEndMap() ?? Site.empty.toFrontEndMap(),
			jobComplete: this.jobComplete,
			testCompleteDate: this.testCompleteDate?.toDate().toISOString(),
			notes: this.notes.map((note) => note.toFrontEndMap()), // Assuming Note has a similar method
			bookings: this.bookings.map((booking) => booking.toFrontEndMap()), // Assuming Booking has a similar method
			stage: this.stage,
			testGroup: this.testGroup,
			isSplitJob: this.isSplitJob,
			isSplitJobParent: this.isSplitJobParent,
			splitJobDetails: this.splitJobDetails
				? this.splitJobDetails.toFrontEndMap() // Assuming SplitJobDetails has a similar method
				: null,
		};
	}

	getAddress(): string {
		return `${this.site?.address}, ${this.site?.city}, ${this.site?.postalCode}, ${this.site?.state}`;
	}

	static empty(): Job {
		return new Job(
			"", // firebaseDocId
			"", // simproId
			"", // name
			"", // customerId
			"", // customer
			null, // site
			false, // jobComplete
			null, // testCompleteDate
			[], // notes
			[], // bookings
			"", // stage
			"", // testGroup
			false, // isSplitJob
			false, // isSplitJobParent
			null, // splitJobDetails
			null // geocode
		);
	}
}
