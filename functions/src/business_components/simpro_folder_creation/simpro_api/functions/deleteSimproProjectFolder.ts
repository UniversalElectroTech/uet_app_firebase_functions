import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../../../../global/services/simpro_api/simproApiService";
import { handleAxiosError } from "../../../../global/services/helper_functions/errorHandling";
import {
	deleteSimproJobFolderRoute,
	deleteSimproQuoteFolderRoute,
} from "../config/routes";

export async function deleteSimproProjectFolder(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const {
			simproId,
			folderId,
			isQuote,
		}: { simproId: string; folderId: string; isQuote: string } = request.data;

		if (!simproId || !folderId) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

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
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
