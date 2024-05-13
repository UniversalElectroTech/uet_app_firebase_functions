import * as admin from "firebase-admin";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { BASE_URL } from "./config/config";
import { getToken } from "./routes";
import { SIMPRO_CLIENT_ID, SIMPRO_CLIENT_SECRET } from "../../..";
export class SimproApiService {
	private instance?: AxiosInstance;
	private initialised: Promise<void>;
	accessToken?: string;
	private tokenExpiresAt?: number;

	constructor() {
		this.initialised = this.init();
	}

	private async init() {
		try {
			await this.refreshAccessToken();
			this.instance = axios.create({
				baseURL: BASE_URL,
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
				},
			});
		} catch (error) {
			console.error("Error initializing ApiService:", error);
			throw error;
		}
	}

	async get(url: string, config?: AxiosRequestConfig) {
		await this.initialised;
		await this.ensureAccessTokenValid();
		return this.instance!.get(url, config);
	}

	async post(url: string, data?: any, config?: AxiosRequestConfig) {
		await this.initialised;
		await this.ensureAccessTokenValid();
		return this.instance!.post(url, data, config);
	}

	async put(url: string, data?: any, config?: AxiosRequestConfig) {
		await this.initialised;
		await this.ensureAccessTokenValid();
		return this.instance!.put(url, data, config);
	}

	async patch(url: string, data?: any, config?: AxiosRequestConfig) {
		await this.initialised;
		await this.ensureAccessTokenValid();
		return this.instance!.patch(url, data, config);
	}

	async delete(url: string, config?: AxiosRequestConfig) {
		await this.initialised;
		await this.ensureAccessTokenValid();
		return this.instance!.delete(url, config);
	}

	private async ensureAccessTokenValid() {
		if (
			!this.accessToken ||
			!this.tokenExpiresAt ||
			Date.now() >= this.tokenExpiresAt
		) {
			await this.refreshAccessToken();
		}
	}

	private async refreshAccessToken() {
		const tokenDocRef = admin
			.firestore()
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
					this.accessToken = tokenData.accessToken;
					this.tokenExpiresAt = tokenData.expiresAt;
					return;
				}
			}

			// If the token doesn't exist or has expired, fetch a new one
			const newAccessToken = await this.fetchAccessToken();
			this.accessToken = newAccessToken.accessToken;
			this.tokenExpiresAt = newAccessToken.expiresAt;
		} catch (error) {
			console.error("Error refreshing access token:", error);
			throw new Error("Failed to refresh access token.");
		}
	}

	private async fetchAccessToken(): Promise<{
		accessToken: string;
		expiresAt: number;
	}> {
		try {
			const response: AxiosResponse = await axios.post(
				getToken,
				{
					grant_type: "client_credentials",
					client_id: `${SIMPRO_CLIENT_ID.value()}`,
					client_secret: `${SIMPRO_CLIENT_SECRET.value()}`,
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
			await this.storeAccessTokenInFirestore(accessToken, expiresIn);

			return { accessToken, expiresAt: Date.now() + expiresIn * 1000 };
		} catch (error) {
			console.error("Error fetching access token:", error);
			throw new Error("Failed to fetch access token.");
		}
	}

	private async storeAccessTokenInFirestore(
		accessToken: string,
		expiresIn: number
	) {
		const tokenDocRef = admin
			.firestore()
			.collection("tokens")
			.doc("simproAccessToken");

		// Set the access token and expiration time in Firestore
		await tokenDocRef.set({
			accessToken,
			expiresAt: Date.now() + expiresIn * 1000, // Convert expiresIn to milliseconds and add to current time
		});
	}
}
