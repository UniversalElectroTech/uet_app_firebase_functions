import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { BASE_URL } from "./config/config";
import { firebaseFunctionsService } from "../../firebase_functions/services/firebaseFunctionsService";

class SimproApiService {
	private static instance: SimproApiService;
	private instance?: AxiosInstance;
	initialised: Promise<void> | null = null;
	accessToken?: string;
	tokenExpiresAt?: number;
	private requestQueue: (() => Promise<any>)[] = [];
	private isProcessingQueue = false;

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
			throw error;
		}
	}

	private async delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	private async processQueue() {
		if (this.isProcessingQueue) return;
		this.isProcessingQueue = true;

		while (this.requestQueue.length > 0) {
			const request = this.requestQueue.shift();
			if (request) {
				try {
					await request();
				} catch (error: any) {
					if (error.response && error.response.status === 429) {
						console.error("HTTP 429: Too Many Requests", error);
						await this.delay(1000); // Pause for 2 seconds before retrying
						// Retry the request
						this.requestQueue.unshift(request); // Re-add the request to the front of the queue
					} else {
						throw error; // Rethrow other errors
					}
				}
			}
		}

		this.isProcessingQueue = false;
	}

	private enqueueRequest(request: () => Promise<any>) {
		this.requestQueue.push(request);
		this.processQueue();
	}

	async get(url: string, config?: AxiosRequestConfig): Promise<any> {
		await this.lazyInit();
		return new Promise((resolve, reject) => {
			this.enqueueRequest(() =>
				this.instance!.get(url, config).then(resolve).catch(reject)
			);
		});
	}

	async post(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<any> {
		await this.lazyInit();
		return new Promise((resolve, reject) => {
			this.enqueueRequest(() =>
				this.instance!.post(url, data, config).then(resolve).catch(reject)
			);
		});
	}

	async put(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<any> {
		await this.lazyInit();
		return new Promise((resolve, reject) => {
			this.enqueueRequest(() =>
				this.instance!.put(url, data, config).then(resolve).catch(reject)
			);
		});
	}

	async patch(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<any> {
		await this.lazyInit();
		return new Promise((resolve, reject) => {
			this.enqueueRequest(() =>
				this.instance!.patch(url, data, config).then(resolve).catch(reject)
			);
		});
	}

	async delete(url: string, config?: AxiosRequestConfig): Promise<any> {
		await this.lazyInit();
		return new Promise((resolve, reject) => {
			this.enqueueRequest(() =>
				this.instance!.delete(url, config).then(resolve).catch(reject)
			);
		});
	}
}

// Usage:
const simproApiService = SimproApiService.getInstance();
export { simproApiService };
