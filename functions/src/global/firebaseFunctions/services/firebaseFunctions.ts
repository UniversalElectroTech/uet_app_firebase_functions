import * as admin from "firebase-admin";
import { SecretParam } from "firebase-functions/lib/params/types";
import { defineSecret } from "firebase-functions/params";
import { setGlobalOptions } from "firebase-functions/v2/options";

class FirebaseFunctionsService {
	private static instance: FirebaseFunctionsService;
	// Simpro secrets
	private _simproClientId: SecretParam;
	private _simproClientSecret: SecretParam;
	// Google Maps API secrets
	private _googleMapsKey: SecretParam;

	private constructor() {
		// Initialize Firebase Admin
		admin.initializeApp();

		// Simpro secrets
		this._simproClientId = defineSecret("SIMPRO_CLIENT_ID");
		this._simproClientSecret = defineSecret("SIMPRO_CLIENT_SECRET");

		// Google Maps API secrets
		this._googleMapsKey = defineSecret("GOOGLE_MAPS_API_KEY");

		// Configure global options
		setGlobalOptions({
			secrets: [
				this._simproClientId,
				this._simproClientSecret,
				this._googleMapsKey,
			],
		});
	}

	public static getInstance(): FirebaseFunctionsService {
		if (!FirebaseFunctionsService.instance) {
			FirebaseFunctionsService.instance = new FirebaseFunctionsService();
		}
		return FirebaseFunctionsService.instance;
	}

	// Simpro Secrets Getters
	// Getter for simproClientId
	get simproClientId(): SecretParam {
		return this._simproClientId;
	}

	// Getter for simproClientSecret
	get simproClientSecret(): SecretParam {
		return this._simproClientSecret;
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
