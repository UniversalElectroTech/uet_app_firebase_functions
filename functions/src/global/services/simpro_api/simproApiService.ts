import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { BASE_URL } from "./config/config";
import { defineSecret } from "firebase-functions/params";
import { getToken } from "./routes";
import { firestore } from "firebase-admin";

export class SimproApiService {
	private instance?: AxiosInstance;
	private initialised: Promise<void>;

	constructor() {
		this.initialised = this.init();
	}

	private async init() {
		try {
			const accessToken = await this._accessTokenProvider();

			this.instance = axios.create({
				baseURL: BASE_URL,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
		} catch (error) {
			console.error("Error initializing ApiService:", error);
			throw error;
		}
	}

	async get(url: string, config?: AxiosRequestConfig) {
		await this.initialised;
		return this.instance!.get(url, config);
	}

	async post(url: string, data?: any, config?: AxiosRequestConfig) {
		await this.initialised;
		return this.instance!.post(url, data, config);
	}

	async put(url: string, data?: any, config?: AxiosRequestConfig) {
		await this.initialised;
		return this.instance!.put(url, data, config);
	}

	async patch(url: string, data?: any, config?: AxiosRequestConfig) {
		await this.initialised;
		return this.instance!.patch(url, data, config);
	}

	async delete(url: string, config?: AxiosRequestConfig) {
		await this.initialised;
		return this.instance!.delete(url, config);
	}

	private async _accessTokenProvider(): Promise<string> {
		const tokenDocRef = firestore()
			.collection("tokens")
			.doc("simproAccessToken");

		try {
			// Retrieve the access token document from Firestore
			const tokenSnapshot = await tokenDocRef.get();

			if (tokenSnapshot.exists) {
				const tokenData = tokenSnapshot.data();

				// Check if the access token is still valid
				if (
					tokenData &&
					tokenData.expiresAt &&
					tokenData.expiresAt > Date.now()
				) {
					return tokenData.accessToken;
				}
			}

			// If the token doesn't exist or has expired, fetch a new one
			const newAccessToken = await this._fetchAccessToken();
			return newAccessToken;
		} catch (error) {
			console.error("Error retrieving access token from Firestore:", error);
			throw new Error("Failed to retrieve access token from Firestore.");
		}
	}

	private async _fetchAccessToken(): Promise<string> {
		try {
			const simproClientID = defineSecret("SIMPRO_CLIENT_ID");
			const simproClientSecret = defineSecret("SIMPRO_CLIENT_SECRET");

			const response: AxiosResponse = await axios.post(
				getToken,
				{
					grant_type: "client_credentials",
					client_id: simproClientID,
					client_secret: simproClientSecret,
				},
				{
					headers: {
						NoAuthToken: true,
					},
				}
			);

			const accessToken = response.data.access_token;
			const expiresIn = response.data.expires_in;

			// Store the access token and expiration time in Firestore
			await this._storeAccessTokenInFirestore(accessToken, expiresIn);

			return accessToken;
		} catch (error) {
			console.error("Error fetching access token:", error);
			throw new Error("Failed to fetch access token.");
		}
	}

	private async _storeAccessTokenInFirestore(
		accessToken: string,
		expiresIn: number
	): Promise<void> {
		const tokenDocRef = firestore()
			.collection("tokens")
			.doc("simproAccessToken");

		// Set the access token and expiration time in Firestore
		await tokenDocRef.set({
			accessToken,
			expiresAt: Date.now() + expiresIn * 1000, // Convert expiresIn to milliseconds and add to current time
		});
	}
}
