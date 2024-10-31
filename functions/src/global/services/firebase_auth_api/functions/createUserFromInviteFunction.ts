import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { UserRecord } from "firebase-functions/v1/auth";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { isTokenValid } from "../../helper_functions/isTokenValid";

// returns all employees in Simpro
export async function createUserFromInvite(request: CallableRequest) {
	const {
		simproId,
		token,
		password,
	}: { simproId: string; token: string; password: string } = request.data;

	// Check if all required parameters have been received
	if (!simproId || !token || !password) {
		throw new HttpsError(
			"failed-precondition",
			"Required parameters are missing."
		);
	}

	try {
		const userSnap = await getFirestore()
			.collection("app_invites")
			.doc(simproId)
			.get();

		if (!userSnap.exists) {
			throw new HttpsError("failed-precondition", "User document is missing.");
		}

		const userData = userSnap.data()!;

		if (userData.inviteToken.token != token) {
			throw new HttpsError("failed-precondition", "Invalid token.");
		}

		if (!isTokenValid(userData.inviteToken.expiration)) {
			throw new HttpsError("failed-precondition", "Token has expired.");
		}

		// Delete invite Doc
		await getFirestore().collection("app_invites").doc(simproId).delete();

		const countryCode = "61";
		const mobileNum = formatToE164(userData.mobile, countryCode);

		// Create the user
		const userRecord: UserRecord = await getAuth().createUser({
			email: userData.email,
			emailVerified: true,
			phoneNumber: mobileNum,
			password: password,
			displayName: userData.name,
			disabled: false,
		});

		// Create user doc
		await getFirestore().collection("app_users").doc(userRecord.uid).set({
			name: userData.name,
			mobile: userData.mobile,
			email: userData.email,
			simproId: simproId,
			securityGroup: null,
			isAccountDeleted: false,
		});

		return userData.email;
	} catch (error: any) {
		if (error instanceof Error) {
			// Handle standard errors
			throw new HttpsError("internal", error.message || "An error occurred");
		} else {
			throw error;
		}
	}
}

function stripSpaces(input: string): string {
	return input.replace(/\s+/g, "");
}

function formatToE164(phoneNumber: string, countryCode: string): string {
	// Remove spaces from the phone number
	phoneNumber = stripSpaces(phoneNumber);

	// Remove leading '0' if it exists
	if (phoneNumber.startsWith("0")) {
		phoneNumber = phoneNumber.slice(1);
	}

	// Ensure the phone number starts with the country code
	return `+${countryCode}${phoneNumber}`;
}
