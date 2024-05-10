import { Site } from "./site";
import { Booking } from "./booking";
import { SplitJobDetails } from "./splitJobDetails";
import { LatLng } from "./LatLng";

export class Job {
	public firebaseDocId: string | null;
	public simproId: string;
	public name: string;
	public customerId: string;
	public customer: string;
	public site: Site;
	public jobComplete: boolean;
	public testCompletionDate: Date | null;
	public notes: any[];
	public bookings: Booking[];
	public stage: string;
	public testGroup: string;
	public isSplitJobParent: boolean;
	public splitJobDetails: SplitJobDetails | null;
	public geocode: LatLng | null;

	constructor({
		firebaseDocId,
		simproId,
		name,
		customerId,
		customer,
		site,
		jobComplete,
		testCompletionDate,
		notes,
		stage,
		bookings = [],
		testGroup = "",
		isSplitJobParent = false,
		splitJobDetails = null,
		geocode = null,
	}: {
		firebaseDocId: string | null;
		simproId: string;
		name: string;
		customerId: string;
		customer: string;
		site: Site;
		jobComplete: boolean;
		testCompletionDate: Date | null;
		notes: any[];
		bookings?: Booking[];
		stage: string;
		testGroup?: string;
		isSplitJobParent?: boolean;
		splitJobDetails?: SplitJobDetails | null;
		geocode?: LatLng | null;
	}) {
		this.firebaseDocId = firebaseDocId;
		this.simproId = simproId;
		this.name = name;
		this.customerId = customerId;
		this.customer = customer;
		this.site = site;
		this.jobComplete = jobComplete;
		this.testCompletionDate = testCompletionDate;
		this.notes = notes;
		this.bookings = bookings;
		this.stage = stage;
		this.testGroup = testGroup;
		this.isSplitJobParent = isSplitJobParent;
		this.splitJobDetails = splitJobDetails;
		this.geocode = geocode;
	}

	static empty(): Job {
		return new Job({
			firebaseDocId: null,
			simproId: "",
			name: "",
			customerId: "",
			customer: "",
			site: Site.empty(),
			jobComplete: false,
			testCompletionDate: null,
			notes: [],
			stage: "",
		});
	}

	copyWith({
		firebaseDocId,
		simproId,
		name,
		customerId,
		customer,
		site,
		jobComplete,
		testCompletionDate,
		notes,
		bookings,
		stage,
		testGroup,
		isSplitJobParent,
		splitJobDetails,
		geocode,
	}: {
		firebaseDocId?: string | null;
		simproId?: string;
		name?: string;
		customerId?: string;
		customer?: string;
		site?: Site;
		jobComplete?: boolean;
		testCompletionDate?: Date | null;
		notes?: any[];
		bookings?: Booking[];
		stage?: string;
		testGroup?: string;
		isSplitJobParent?: boolean;
		splitJobDetails?: SplitJobDetails | null;
		geocode?: LatLng | null;
	}): Job {
		return new Job({
			firebaseDocId: firebaseDocId ?? this.firebaseDocId,
			simproId: simproId ?? this.simproId,
			name: name ?? this.name,
			customerId: customerId ?? this.customerId,
			customer: customer ?? this.customer,
			site: site ?? this.site,
			jobComplete: jobComplete ?? this.jobComplete,
			testCompletionDate: testCompletionDate ?? this.testCompletionDate,
			notes: notes ?? this.notes,
			bookings: bookings ?? this.bookings,
			stage: stage ?? this.stage,
			testGroup: testGroup ?? this.testGroup,
			isSplitJobParent: isSplitJobParent ?? this.isSplitJobParent,
			splitJobDetails: splitJobDetails ?? this.splitJobDetails,
			geocode: geocode ?? this.geocode,
		});
	}

	static fromSimproMap({
		jobData,
		siteData,
	}: {
		jobData: { [key: string]: any };
		siteData: { [key: string]: any };
	}): Job {
		let testGroup: string | null = null;
		const customFields = jobData["CustomFields"] as any[];
		if (customFields) {
			const customField = customFields.find(
				(field) => field["CustomField"]["Name"] === "RCD Test Group"
			);
			if (customField) {
				const value = parseInt(customField["Value"] ?? "", 10);
				testGroup = isNaN(value) ? null : value.toString();
			}
		}

		return new Job({
			firebaseDocId: jobData["docId"],
			simproId: jobData["ID"].toString(),
			name: jobData["Name"].toString(),
			customerId: jobData["Customer"]["ID"].toString(),
			customer: jobData["Customer"]["CompanyName"].toString(),
			site: Site.fromMap(siteData),
			jobComplete: false,
			testCompletionDate: new Date(),
			notes: jobData["notes"] || [],
			bookings: ((jobData["bookings"] as any[]) || []).map((e) =>
				Booking.fromFirebaseMap(e)
			),
			stage: jobData["Stage"].toString(),
			testGroup: testGroup ?? "",
			isSplitJobParent: jobData["isSplitJobParent"] ?? false,
			splitJobDetails: jobData["splitJobDetails"]
				? SplitJobDetails.fromFirebaseMap(jobData["splitJobDetails"])
				: null,
			geocode: null,
		});
	}
}