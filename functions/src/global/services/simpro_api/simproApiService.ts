import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { BASE_URL } from "./config/config";
import { firebaseFunctionsService } from "../../firebaseFunctions/services/firebaseFunctions";

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
			this.instance = axios.create({
				baseURL: BASE_URL,
				headers: {
					Authorization: `Bearer ${firebaseFunctionsService.simproKey.value()}`,
					"Content-Type": "application/json",
				},
			});
		} catch (error) {
			console.error("Error initializing ApiService:", error);
			throw error;
		}
	}

	async get(url: string, config?: AxiosRequestConfig) {
		await this.lazyInit();
		return this.instance!.get(url, config);
	}

	async post(url: string, data?: any, config?: AxiosRequestConfig) {
		await this.lazyInit();
		return this.instance!.post(url, data, config);
	}

	async put(url: string, data?: any, config?: AxiosRequestConfig) {
		await this.lazyInit();
		return this.instance!.put(url, data, config);
	}

	async patch(url: string, data?: any, config?: AxiosRequestConfig) {
		await this.lazyInit();
		return this.instance!.patch(url, data, config);
	}

	async delete(url: string, config?: AxiosRequestConfig) {
		await this.lazyInit();
		return this.instance!.delete(url, config);
	}
}

// Usage:
const simproApiService = SimproApiService.getInstance();
export { simproApiService };
