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
	// Resend Email API secret
	private _resendEmailKey: SecretParam;

	private constructor() {
		// Initialize Firebase Admin
		admin.initializeApp();

		// Password for App initial Creation
		this._appInitialPassword = defineSecret("APP_INITIAL_PASSWORD");

		// Simpro secret
		this._simproKey = defineSecret("SIMPRO_KEY");

		// Google Maps API secret
		this._googleMapsKey = defineSecret("GOOGLE_MAPS_API_KEY");

		// Resend Email API secret
		this._resendEmailKey = defineSecret("Resend_email_api_key");

		// Configure global options
		setGlobalOptions({
			secrets: [
				this._appInitialPassword,
				this._simproKey,
				this._googleMapsKey,
				this._resendEmailKey,
			],
		});
	}

	static getInstance(): FirebaseFunctionsService {
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

	// Getter for Simpro API Key Secret
	get simproKey(): SecretParam {
		return this._simproKey;
	}

	// Getter for Google Maps API key Secret
	get googleMapsKey(): SecretParam {
		return this._googleMapsKey;
	}

	// Getter for Resend email API key Secret
	get resendEmailKey(): SecretParam {
		return this._resendEmailKey;
	}
}

// Usage:
const firebaseFunctionsService = FirebaseFunctionsService.getInstance();
export { firebaseFunctionsService };
