import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { handleAxiosError } from "../../../../global/services/helper_functions/errorHandling";
import {
	createQuoteAttachmentsRoute,
	createSimproJobFolderRoute,
} from "../config/routes";
import { simproApiService } from "../../../../global/services/simpro_api/simproApiService";

export async function createSimproProjectFolder(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const {
			simproId,
			folderName,
			isQuote,
		}: { simproId: string; folderName: string; isQuote: boolean } =
			request.data;

		if (!simproId || !folderName) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		var response;

		if (isQuote) {
			response = await simproApiService.post(
				createQuoteAttachmentsRoute(simproId),
				{ Name: folderName }
			);
		} else {
			response = await simproApiService.post(
				createSimproJobFolderRoute(simproId),
				{ Name: folderName }
			);
		}

		return response.data;
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
