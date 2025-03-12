import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import {
	deleteSimproJobFolderRoute,
	deleteSimproQuoteFolderRoute,
} from "../config/routes";

export async function deleteSimproProjectFolderHandler(
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
			folderId,
			isQuote,
		}: { simproId: string; folderId: string; isQuote: boolean } = request.data;

		if (!simproId || !folderId) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		return await deleteSimproProjectFolder(simproId, folderId, isQuote);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function deleteSimproProjectFolder(
	simproId: string,
	folderId: string,
	isQuote: boolean
) {
	if (isQuote) {
		await simproApiService.delete(
			deleteSimproQuoteFolderRoute(simproId, folderId)
		);
	} else {
		await simproApiService.delete(
			deleteSimproJobFolderRoute(simproId, folderId)
		);
	}

	return { success: true };
}
