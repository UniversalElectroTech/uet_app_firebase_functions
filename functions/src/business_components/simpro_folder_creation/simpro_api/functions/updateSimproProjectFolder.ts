import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../../../../global/services/simpro_api/simproApiService";
import { handleAxiosError } from "../../../../global/services/helper_functions/errorHandling";
import {
	updateSimproJobFolderNameRoute,
	updateSimproQuoteFolderNameRoute,
} from "../config/routes";

export async function updateSimproProjectFolder(request: CallableRequest) {
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
			newFolderName,
			isQuote,
		}: {
			simproId: string;
			folderId: string;
			newFolderName: string;
			isQuote: boolean;
		} = request.data;

		if (!simproId || !folderId || !newFolderName) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		var response;

		if (isQuote) {
			response = await simproApiService.patch(
				updateSimproQuoteFolderNameRoute(simproId, folderId),
				{ name: newFolderName }
			);
		} else {
			response = await simproApiService.patch(
				updateSimproJobFolderNameRoute(simproId, folderId),
				{ name: newFolderName }
			);
		}

		return response.data;
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
