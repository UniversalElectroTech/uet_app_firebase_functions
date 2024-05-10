import axios, { AxiosError, AxiosResponse } from "axios";

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getToken } from "../routes";
import { defineSecret } from "firebase-functions/params";
import { SimproAuth } from "../model/simproAuth";

exports.getAuthToken = onCall(async () => {
	const simproClientID = defineSecret("SIMPRO_CLIENT_ID");
	const simproClientSecret = defineSecret("SIMPRO_CLIENT_SECRET");

	try {
		const headers = {
			NoAuthToken: true,
		};

		const response: AxiosResponse = await axios.post(
			getToken,
			{
				grant_type: "client_credentials",
				client_id: simproClientID,
				client_secret: simproClientSecret,
			},
			{
				headers: headers,
			}
		);

		// Extract the relevant fields from the JSON response
		const accessToken: string = response.data["access_token"];
		const expiresIn: number = response.data["expires_in"];

		// Use the factory method to create a SimproAuth object
		const simproAuth: SimproAuth = SimproAuth.fromSimproMap({
			access_token: accessToken,
			expires_in: expiresIn,
		});

		return simproAuth;
	} catch (error: any) {
		if (axios.isAxiosError(error)) {
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
