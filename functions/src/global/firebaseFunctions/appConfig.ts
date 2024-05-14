import * as admin from "firebase-admin";
import { SecretParam } from "firebase-functions/lib/params/types";
import { defineSecret } from "firebase-functions/params";
import { setGlobalOptions } from "firebase-functions/v2/options";

class FirebaseConfig {
	private static instance: FirebaseConfig;
	private _simproClientId: SecretParam;
	private _simproClientSecret: SecretParam;

	private constructor() {
		// Initialize Firebase Admin
		admin.initializeApp();

		// Define secrets
		this._simproClientId = defineSecret("SIMPRO_CLIENT_ID");
		this._simproClientSecret = defineSecret("SIMPRO_CLIENT_SECRET");

		// Configure global options
		setGlobalOptions({
			secrets: [this._simproClientId, this._simproClientSecret],
		});
	}

	public static getInstance(): FirebaseConfig {
		if (!FirebaseConfig.instance) {
			FirebaseConfig.instance = new FirebaseConfig();
		}
		return FirebaseConfig.instance;
	}

	// Getter for simproClientId
	get simproClientId(): SecretParam {
		return this._simproClientId;
	}

	// Getter for simproClientSecret
	get simproClientSecret(): SecretParam {
		return this._simproClientSecret;
	}
}

// Usage:
const firebaseFunctionsConfig = FirebaseConfig.getInstance();
export { firebaseFunctionsConfig };
