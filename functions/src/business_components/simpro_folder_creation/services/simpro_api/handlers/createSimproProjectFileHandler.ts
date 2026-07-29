import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import {
	createSimproJobFileRoute,
	createSimproQuoteFileRoute,
} from "../config/routes";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";

// Firebase callable payloads max ~10 MB. Base64 expands ~4/3, so keep raw under 7 MB.
const MAX_FILE_SIZE_BYTES = 7 * 1024 * 1024;

export async function createSimproProjectFileHandler(request: CallableRequest) {
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
			filename,
			base64Data,
			folderId,
		}: {
			simproId: string;
			isQuote: boolean;
			filename: string;
			base64Data: string;
			folderId?: number | null;
		} = request.data;

		if (!simproId || !filename || !base64Data) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		const bytes = Buffer.from(base64Data, "base64");
		if (bytes.length > MAX_FILE_SIZE_BYTES) {
			throw new HttpsError(
				"invalid-argument",
				"File exceeds the 7 MB transfer limit for uploads through the app."
			);
		}

		// Admins upload private files; everyone else uploads public files.
		const userIsAdmin = await isAdmin(request.auth.uid);
		const payload: Record<string, unknown> = {
			Filename: filename,
			Base64Data: base64Data,
			Public: !userIsAdmin,
			Email: false,
		};
		if (folderId != null) {
			payload.Folder = folderId;
		}

		const route = isQuote
			? createSimproQuoteFileRoute(simproId)
			: createSimproJobFileRoute(simproId);

		const response = await simproApiService.post(route, payload, {
			maxBodyLength: Infinity,
			maxContentLength: Infinity,
		});
		return response.data;
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
