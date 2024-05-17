import * as admin from "firebase-admin";
import { SecretParam } from "firebase-functions/lib/params/types";
import { defineSecret } from "firebase-functions/params";
import { setGlobalOptions } from "firebase-functions/v2/options";

class FirebaseFunctionsService {
	private static instance: FirebaseFunctionsService;
	// Password for App initial Creation
	private _appInitialPassword: SecretParam;
	// Simpro secrets
	private _simproKey: SecretParam;
	// Google Maps API secrets
	private _googleMapsKey: SecretParam;

	private constructor() {
		// Initialize Firebase Admin
		admin.initializeApp();

		// Password for App initial Creation
		this._appInitialPassword = defineSecret("APP_INITIAL_PASSWORD");

		// Simpro secrets
		this._simproKey = defineSecret("SIMPRO_KEY");

		// Google Maps API secrets
		this._googleMapsKey = defineSecret("GOOGLE_MAPS_API_KEY");

		// Configure global options
		setGlobalOptions({
			secrets: [this._simproKey, this._googleMapsKey],
		});
	}

	public static getInstance(): FirebaseFunctionsService {
		if (!FirebaseFunctionsService.instance) {
			FirebaseFunctionsService.instance = new FirebaseFunctionsService();
		}
		return FirebaseFunctionsService.instance;
	}

	// Password for App initial Creation
	// Getter for appInitialPassword
	get appInitialPassword(): SecretParam {
		return this._appInitialPassword;
	}

	// Simpro Secrets Getters
	// Getter for simproClientId
	get simproKey(): SecretParam {
		return this._simproKey;
	}

	// Google Maps Secrets Getters
	// Getter for Google Maps api key
	get googleMapsKey(): SecretParam {
		return this._googleMapsKey;
	}
}

// Usage:
const firebaseFunctionsService = FirebaseFunctionsService.getInstance();
export { firebaseFunctionsService };
