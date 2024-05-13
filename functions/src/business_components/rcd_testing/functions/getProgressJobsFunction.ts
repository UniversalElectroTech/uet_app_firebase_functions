import {
	onCall,
	HttpsError,
	CallableRequest,
} from "firebase-functions/v2/https";
import axios, { AxiosError } from "axios";
import { getRcdProgressJobsRoute } from "../services/simpro_api/routes";
import { Job } from "../models/job";
import { initializeApp } from "firebase-admin/app";
import {
	DocumentData,
	getFirestore,
	QuerySnapshot,
} from "firebase-admin/firestore";
import { LatLng } from "../models/LatLng";
import { getSitesRoute } from "../../../global/services/simpro_api/routes";
import { SimproApiService } from "../../../global/services/simpro_api/simproApiService";

// Returns all RCD testing progress jobs from the SimproAPI
exports.getProgressJobs = onCall(async (request: CallableRequest) => {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be " + "called while authenticated."
		);
	}

	try {
		// Prepare SimproAPIService
		const simproApiService = new SimproApiService();

		// Extract and validate data from the client
		const { page, returnCount, customerSimproId } = request.data;

		// Check if all required parameters have been received
		if (!page || !returnCount || !customerSimproId) {
			throw new Error("Required parameters are missing.");
		}

		// GET rcd progress jobs via SimproAPI
		const jobResponse = await axios.get(
			getRcdProgressJobsRoute(customerSimproId, returnCount, page)
		);
		const jobList: any[] = jobResponse.data;

		// Check if no jobs returned from request and if so return the empty list
		if (jobList.length === 0) {
			const returnMap = {
				jobs: [],
				resultTotal: jobResponse.headers["result-total"],
				resultCount: jobResponse.headers["result-count"],
			};
			return returnMap;
		}

		// Collect and prepare all job site IDs from jobs for subsequent SimproAPI request
		const siteIds: string[] = jobList.map((job) =>
			job["Site"]["ID"].toString()
		);
		const siteAddressIds: string = siteIds.join(",");

		// GET job site information via SimproAPI
		const siteAddressResponse = await simproApiService.get(
			getSitesRoute(siteAddressIds)
		);
		const siteAddressList: any[] = siteAddressResponse.data;

		// Get geocode data to be added to jobs
		const geocodeData = await getGeoData();

		// Create list of job objects using collected data
		const jobs: Job[] = jobList.map((jobJson) => {
			const siteId: string = jobJson["Site"]["ID"].toString();
			const siteData: any =
				siteAddressList.find((site) => site["ID"].toString() === siteId) || {};
			const job: Job = Job.fromSimproMap({
				jobData: jobJson,
				siteData: siteData,
			});

			// Check if the job site address has applicable geocode data and add it to job if so
			const address = job.site.address;
			if (geocodeData && geocodeData.has(address)) {
				// If there's a match, get the corresponding LatLng value
				const latLng = geocodeData.get(address);
				// Update the job with the LatLng value
				job.copyWith({ geocode: latLng });
			}

			return job;
		});

		// Return a map with job data, result total and result count
		const returnMap = {
			jobs: jobs,
			resultTotal: jobResponse.headers["result-total"],
			resultCount: jobResponse.headers["result-count"],
		};
		return returnMap;
	} catch (error: any) {
		if (error instanceof Error) {
			// Handle standard errors
			throw new HttpsError("internal", error.message || "An error occurred");
		} else if (axios.isAxiosError(error)) {
			// Handle Axios errors
			const axiosError = error as AxiosError<{ errorMessage?: string }>;
			const serverErrorMessage = axiosError.response?.data?.errorMessage;
			const errorMessage =
				serverErrorMessage || axiosError.message || "An error occurred";
			throw new HttpsError("internal", errorMessage);
		} else {
			// Handle other types of errors
			throw new HttpsError("internal", "An unknown error occurred");
		}
	}
});

// Get all geoData saved in firestore database
// MAY REQUIRE A NEW WAY OF DOING THIS AS GEOCODE LIST INCREASES
// SHOULD CHANGE ALL DATA FROM ONE DOCUMENT TO SEPERATE DOCUMENTS TO RETURN ONLY REQUIRED DATA INSTEAD OF RETURNING ALL DATA
async function getGeoData(): Promise<Map<string, LatLng>> {
	initializeApp();
	const db = getFirestore();
	const querySnapshot: QuerySnapshot<DocumentData> = await db
		.collection("sites")
		.limit(1)
		.get();
	let geocodeData: Map<string, LatLng> = new Map();

	// Check if any document exists
	if (!querySnapshot.empty) {
		const data = querySnapshot.docs[0].data();
		const geocodes: Map<string, LatLng> = new Map();

		// Assuming geocodes is a map in the document where the key is the address and the value is an array [latitude, longitude]
		Object.entries(data.geocodes).forEach(([address, coordinates]) => {
			const latLng = LatLng.fromFirebaseMap(coordinates);
			geocodes.set(address, latLng);
		});

		geocodeData = geocodes;
	}
	return geocodeData;
}
