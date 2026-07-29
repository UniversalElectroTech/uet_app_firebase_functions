import { randomUUID } from "crypto";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getDownloadURL, getStorage } from "firebase-admin/storage";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import {
	getSimproJobFileRoute,
	getSimproQuoteFileRoute,
} from "../config/routes";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";

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
		const uid = request.auth.uid;
		const safeName = filename.replace(/[^\w.\-()+ ]+/g, "_");
		const storagePath = `simpro_folder_creation/downloads/${uid}/${randomUUID()}_${safeName}`;
		const file = getStorage().bucket().file(storagePath);

		await file.save(bytes, {
			metadata: {
				contentType: data?.MimeType || "application/octet-stream",
				metadata: {
					originalFilename: filename,
					expiresAt: String(Date.now() + 60 * 60 * 1000),
				},
			},
		});

		const downloadUrl = await getDownloadURL(file);

		return {
			filename,
			downloadUrl,
			storagePath,
			mimeType: data?.MimeType ?? null,
			fileSizeBytes: bytes.length,
		};
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
