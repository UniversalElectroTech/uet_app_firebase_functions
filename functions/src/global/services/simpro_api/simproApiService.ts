import * as admin from "firebase-admin";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { firebaseFunctionsService } from "../../firebaseFunctions/services/firebaseFunctions";
import { BASE_URL } from "./config/config";
import { getToken } from "./config/routes";

class SimproApiService {
	private static instance: SimproApiService;
	private instance?: AxiosInstance;
	initialised: Promise<void> | null = null;
	accessToken?: string;
	tokenExpiresAt?: number;

	public static getInstance(): SimproApiService {
		if (!SimproApiService.instance) {
			SimproApiService.instance = new SimproApiService();
		}
		return SimproApiService.instance;
	}

	async lazyInit() {
		if (!this.instance) {
			this.initialised = this.init();
		}
		await this.initialised;
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
		await this.lazyInit();
		return this.retryRequest(() => this.instance!.get(url, config));
	}

	async post(url: string, data?: any, config?: AxiosRequestConfig) {
		await this.lazyInit();
		return this.retryRequest(() => this.instance!.post(url, data, config));
	}

	async put(url: string, data?: any, config?: AxiosRequestConfig) {
		await this.lazyInit();
		return this.retryRequest(() => this.instance!.put(url, data, config));
	}

	async patch(url: string, data?: any, config?: AxiosRequestConfig) {
		await this.lazyInit();
		return this.retryRequest(() => this.instance!.patch(url, data, config));
	}

	async delete(url: string, config?: AxiosRequestConfig) {
		await this.lazyInit();
		return this.retryRequest(() => this.instance!.delete(url, config));
	}

	private async retryRequest(
		requestFn: () => Promise<AxiosResponse>
	): Promise<AxiosResponse> {
		try {
			await this.ensureAccessTokenValid();
			return await requestFn();
		} catch (error) {
			if (this.isUnauthorizedError(error)) {
				await this.refreshAccessToken();
				return await requestFn();
			} else {
				throw error;
			}
		}
	}

	private isUnauthorizedError(error: any): boolean {
		return error.response && error.response.status === 401;
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
			const tokenSnapshot = await tokenDocRef.get();

			if (tokenSnapshot.exists) {
				const tokenData = tokenSnapshot.data();

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
					client_id: firebaseFunctionsService.simproClientId.value(),
					client_secret: firebaseFunctionsService.simproClientSecret.value(),
				},
				{
					headers: {
						NoAuthToken: true,
					},
				}
			);

			const accessToken = response.data.access_token;
			const expiresIn = response.data.expires_in;

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

		await tokenDocRef.set({
			accessToken,
			expiresAt: Date.now() + expiresIn * 1000,
		});
	}
}

// Usage:
const simproApiService = SimproApiService.getInstance();
export { simproApiService };
