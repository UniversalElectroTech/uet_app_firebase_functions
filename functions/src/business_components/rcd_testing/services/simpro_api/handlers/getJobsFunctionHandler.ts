import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import admin = require("firebase-admin");
import {
	getRcdCompleteJobsRoute,
	getRcdProgressJobsRoute,
} from "../config/routes";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { getSiteDetails } from "./getProgressJobsFunctionHandler";
import { getGeocodeByAddress } from "../../../../../global/services/google_maps_api/handlers/getGeocodeByAddressHandler";
import { Job } from "../../../models/job";

// Returns all RCD testing complete jobs from the SimproAPI
export async function getJobsHandler(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be " + "called while authenticated."
		);
	}

	try {
		// Extract and validate data from the client
		const {
			jobStage,
			page,
			returnCount,
			customerSimproId,
			employeeSimproId,
		}: {
			jobStage: string;
			page: number;
			returnCount: number;
			customerSimproId: string;
			employeeSimproId: string;
		} = request.data;

		// Check if all required parameters have been received
		if (
			jobStage === undefined ||
			jobStage === null ||
			page === undefined ||
			page === null ||
			returnCount === undefined ||
			returnCount === null ||
			!customerSimproId ||
			!employeeSimproId
		) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		return await getJobs(
			jobStage,
			page,
			returnCount,
			customerSimproId,
			employeeSimproId
		);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

// Function to get jobs
async function getJobs(
	jobStage: string,
	page: number,
	returnCount: number,
	customerSimproId: string,
	employeeSimproId: string
) {
	let jobResponse;
	let updatedJobs: Job[] = [];

	if (jobStage === "complete") {
		// GET rcd progress jobs via SimproAPI
		jobResponse = await simproApiService.get(
			getRcdCompleteJobsRoute(
				employeeSimproId,
				customerSimproId,
				returnCount,
				page
			)
		);
	} else if (jobStage === "progress") {
		// GET rcd progress jobs via SimproAPI
		jobResponse = await simproApiService.get(
			getRcdProgressJobsRoute(
				employeeSimproId,
				customerSimproId,
				returnCount,
				page
			)
		);
	} else {
		throw new HttpsError("failed-precondition", "Invalid job stage.");
	}

	const jobList: any[] = jobResponse.data;

	// Check if no jobs returned from request and if so return the empty list
	if (jobList.length === 0) {
		const returnMap = {
			jobs: [],
			siteAddresses: [],
			resultTotal: jobResponse.headers["result-total"],
			resultCount: jobResponse.headers["result-count"],
		};
		return returnMap;
	}

	// Collect and prepare all job site IDs from jobs for subsequent SimproAPI request
	const siteIds: string[] = jobList.map((job) => job["Site"]["ID"].toString());
	const siteAddressIds: string = siteIds.join(",");

	// GET job site information via SimproAPI
	const siteAddressResponse = await getSiteDetails(siteAddressIds, returnCount);
	const siteAddressList: any[] = siteAddressResponse;

	// Map job data to Job model instances
	updatedJobs = jobList.map((jobData) => {
		const siteData = siteAddressList.find(
			(site) => site.ID === jobData.Site.ID
		);
		return Job.fromSimproMap(jobData, siteData); // Create Job instance
	});

	// Get geocodes for jobs
	updatedJobs = await getJobsGeocodes(updatedJobs);

	// Return a map with job data, result total and result count
	const returnMap = {
		jobs: updatedJobs,
		siteAddresses: siteAddressList,
		resultTotal: jobResponse.headers["result-total"],
		resultCount: jobResponse.headers["result-count"],
	};
	return returnMap;
}

// Function to get geocodes for jobs
async function getJobsGeocodes(jobList: Job[]) {
	// Create an array to hold updated jobs
	const updatedJobs: Job[] = [];

	for (const job of jobList) {
		// Check if no job site address
		if (job.site?.address === "") {
			continue; // Skip jobs without an address
		}
		const address = job.getAddress(); // Assuming getAddress() is a method that returns the job's address

		// Fetch existing geocode for the address from Firestore
		const siteGeocode = await fetchGeocodeForAddress(address);

		if (siteGeocode) {
			// If geocode exists in Firestore
			updatedJobs.push(job.copyWith({ geocode: siteGeocode })); // Update job with existing geocode
		}
	}

	return updatedJobs;
}

// Function to fetch a geocode for a specific address from Firestore
async function fetchGeocodeForAddress(
	address: string
): Promise<{ latitude: number; longitude: number } | null> {
	try {
		const sitesCollection = admin.firestore().collection("sites");
		const querySnapshot = await sitesCollection
			.where("address", "==", address)
			.limit(1)
			.get();

		let geocode: { latitude: number; longitude: number } | null = null;

		// If geocode exists in Firestore
		if (!querySnapshot.empty) {
			const data = querySnapshot.docs[0].data();
			const geocodesData = data["geocodes"] || {};
			geocode = geocodesData[address] as {
				latitude: number;
				longitude: number;
			} | null;
		} else {
			// If geocode doesn't exist, fetch from Google Geocoding API
			geocode = await getGeocodeByAddress(address);
			// If geocode is found, add it to Firestore
			if (geocode) {
				await addGeocodeToFirestore(address, geocode);
			}
		}

		if (geocode) {
			return { latitude: geocode.latitude, longitude: geocode.longitude };
		}
		return null;
	} catch (e) {
		throw e;
	}
}

// Function to add a geocode to Firestore
async function addGeocodeToFirestore(
	address: string,
	geocode: { latitude: number; longitude: number }
) {
	try {
		const sitesCollection = admin.firestore().collection("sites");
		await sitesCollection.add({
			address: address,
			geocode: {
				latitude: geocode.latitude,
				longitude: geocode.longitude,
			},
		});
	} catch (e) {
		throw e;
	}
}
