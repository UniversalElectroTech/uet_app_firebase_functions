import axios from "axios";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getGeocodeRoute } from "../config/routes";
import { firebaseFunctionsService } from "../../../firebase_functions/services/firebaseFunctionsService";

export async function getGeocodeByAddressHandler(request: CallableRequest) {
	var address: string = "";
	try {
		// Check that the user is authenticated.
		if (!request.auth) {
			throw new HttpsError(
				"failed-precondition",
				"The function must be called while authenticated."
			);
		}

		address = request.data.address;

		if (!address) {
			throw new HttpsError("invalid-argument", "Address is null.");
		}

		const headers = {
			NoAuthToken: "true",
		};
		await getGeocodeByAddress(address, headers);
	} catch (error: any) {
		// Error occurred during geocoding
		if (axios.isAxiosError(error)) {
			throw new HttpsError(
				"internal",
				`Error getting coordinates for ${address}: ${error.message}`
			);
		} else {
			throw new HttpsError("internal", `Unexpected error: ${error}`);
		}
	}
}

async function getGeocodeByAddress(address: string, headers: object) {
	const apiKey = firebaseFunctionsService.googleMapsKey; // Make sure to set this in your environment variables

	const encodedAddress = encodeURIComponent(address);

	const response = await axios.get(getGeocodeRoute(encodedAddress, apiKey), {
		headers,
	});

	if (response.status === 200) {
		const data = response.data;

		// Check if the response contains results
		if (data.results && data.results.length > 0) {
			const location = data.results[0].geometry.location;
			const latitude = location.lat;
			const longitude = location.lng;

			return { latitude: latitude, longitude: longitude };
		} else {
			// No location found for the address
			throw new HttpsError(
				"not-found",
				`No location found for the address: ${address}`
			);
		}
	} else {
		// HTTP request failed
		throw new HttpsError(
			"internal",
			`Failed to fetch coordinates for ${address}. Status code: ${response.status}`
		);
	}
}
