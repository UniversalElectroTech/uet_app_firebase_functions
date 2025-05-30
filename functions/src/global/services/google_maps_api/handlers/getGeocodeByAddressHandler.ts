import axios from "axios";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getGeocodeRoute } from "../config/routes";
import { firebaseFunctionsService } from "../../../firebase_functions/services/firebaseFunctionsService";
import { handleAxiosError } from "../../helper_functions/errorHandling";

export async function getGeocodeByAddressHandler(request: CallableRequest) {
	try {
		// Check that the user is authenticated.
		if (!request.auth) {
			throw new HttpsError(
				"failed-precondition",
				"The function must be called while authenticated."
			);
		}

		const { address }: { address: string } = request.data;

		// Check if all required parameters have been received
		if (!address) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		return await getGeocodeByAddress(address);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

export async function getGeocodeByAddress(address: string) {
	const headers = {
		NoAuthToken: "true",
	};
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
