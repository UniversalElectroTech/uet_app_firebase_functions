import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import {
	getSimproJobFileRoute,
	getSimproQuoteFileRoute,
} from "../config/routes";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";

// Firebase callable payloads max ~10 MB. Base64 expands ~4/3, so keep raw under 7 MB.
const MAX_FILE_SIZE_BYTES = 7 * 1024 * 1024;

export async function downloadSimproProjectFileHandler(
	request: CallableRequest
) {
	try {
		if (!request.auth) {
			throw new HttpsError(
				"failed-precondition",
				"The function must be called while authenticated."
			);
		}

		const {
			simproId,
			isQuote,
			fileId,
		}: { simproId: string; isQuote: boolean; fileId: string } = request.data;

		if (!simproId || !fileId) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		const route = isQuote
			? getSimproQuoteFileRoute(simproId, fileId)
			: getSimproJobFileRoute(simproId, fileId);

		const response = await simproApiService.get(`${route}?display=Base64`, {
			maxBodyLength: Infinity,
			maxContentLength: Infinity,
		});

		const data = response.data;
		const userIsAdmin = await isAdmin(request.auth.uid);
		if (data?.Public !== true && !userIsAdmin) {
			throw new HttpsError(
				"permission-denied",
				"You do not have permission to download this file."
			);
		}

		const filename = String(data?.Filename ?? `attachment-${fileId}`);
		const base64Data = data?.Base64Data;
		if (!base64Data || typeof base64Data !== "string") {
			throw new HttpsError(
				"internal",
				"Simpro did not return file contents."
			);
		}

		const bytes = Buffer.from(base64Data, "base64");
		if (bytes.length > MAX_FILE_SIZE_BYTES) {
			throw new HttpsError(
				"invalid-argument",
				"File exceeds the 7 MB transfer limit for downloads through the app. Open it in Simpro instead."
			);
		}

		return {
			filename,
			base64Data,
			mimeType: data?.MimeType ?? null,
			fileSizeBytes: bytes.length,
		};
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
