import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../../../../global/services/simpro_api/simproApiService";
import { handleAxiosError } from "../../../../global/services/helper_functions/errorHandling";
import {
	getSimproJobFoldersRoute,
	getSimproQuoteFoldersRoute,
} from "../config/routes";

export async function getSimproProjectFolders(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const { simproId, isQuote }: { simproId: string; isQuote: boolean } =
			request.data;

		if (!simproId) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		var response;

		if (isQuote) {
			response = await simproApiService.get(
				getSimproQuoteFoldersRoute(simproId)
			);
		} else {
			response = await simproApiService.get(getSimproJobFoldersRoute(simproId));
		}

		return response.data;
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
