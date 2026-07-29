import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getStorage } from "firebase-admin/storage";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import {
	createSimproJobFileRoute,
	createSimproQuoteFileRoute,
} from "../config/routes";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";

const MAX_FILE_SIZE_BYTES = 80 * 1024 * 1024;

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
			storagePath,
			folderId,
		}: {
			simproId: string;
			isQuote: boolean;
			filename: string;
			storagePath: string;
			folderId?: number | null;
		} = request.data;

		if (!simproId || !filename || !storagePath) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		const uid = request.auth.uid;
		if (!storagePath.startsWith(`simpro_folder_creation/temp/${uid}/`)) {
			throw new HttpsError(
				"permission-denied",
				"Invalid storage path for upload."
			);
		}

		const file = getStorage().bucket().file(storagePath);
		const [exists] = await file.exists();
		if (!exists) {
			throw new HttpsError("not-found", "Uploaded file was not found.");
		}

		const [metadata] = await file.getMetadata();
		const size = Number(metadata.size ?? 0);
		if (size > MAX_FILE_SIZE_BYTES) {
			await file.delete({ ignoreNotFound: true });
			throw new HttpsError(
				"invalid-argument",
				"File exceeds Simpro's 80 MB attachment limit."
			);
		}

		// Admins upload private files; everyone else uploads public files.
		const userIsAdmin = await isAdmin(uid);
		const [bytes] = await file.download();
		const payload: Record<string, unknown> = {
			Filename: filename,
			Base64Data: bytes.toString("base64"),
			Public: !userIsAdmin,
			Email: false,
		};
		if (folderId != null) {
			payload.Folder = folderId;
		}

		const route = isQuote
			? createSimproQuoteFileRoute(simproId)
			: createSimproJobFileRoute(simproId);

		try {
			const response = await simproApiService.post(route, payload, {
				maxBodyLength: Infinity,
				maxContentLength: Infinity,
			});
			return response.data;
		} finally {
			await file.delete({ ignoreNotFound: true });
		}
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
