import * as admin from "firebase-admin";
admin.initializeApp();

import { defineSecret } from "firebase-functions/params";
export const SIMPRO_CLIENT_ID = defineSecret("SIMPRO_CLIENT_ID");
export const SIMPRO_CLIENT_SECRET = defineSecret("SIMPRO_CLIENT_SECRET");

import {
	CallableRequest,
	HttpsError,
	onCall,
} from "firebase-functions/v2/https";
import axios, { AxiosError } from "axios";
import { SimproApiService } from "./global/services/simpro_api/simproApiService";

// Test Functions
exports.testFunction = onCall(async (request: CallableRequest) => {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be " + "called while authenticated."
		);
	}
	return "Hello, world!";
});

exports.testTokenAuth = onCall(async (request: CallableRequest) => {
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

		return simproApiService.accessToken;
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
