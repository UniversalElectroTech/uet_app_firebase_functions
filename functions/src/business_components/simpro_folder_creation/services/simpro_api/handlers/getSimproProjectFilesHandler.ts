import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import {
	getSimproJobFilesRoute,
	getSimproQuoteFilesRoute,
} from "../config/routes";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";

export async function getSimproProjectFilesHandler(request: CallableRequest) {
	try {
		if (!request.auth) {
			throw new HttpsError(
				"failed-precondition",
				"The function must be called while authenticated."
			);
		}

		const { simproId, isQuote }: { simproId: string; isQuote: boolean } =
			request.data;

		if (!simproId) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		const route = isQuote
			? getSimproQuoteFilesRoute(simproId)
			: getSimproJobFilesRoute(simproId);

		const response = await simproApiService.get(route);
		const files = Array.isArray(response.data) ? response.data : [];
		const userIsAdmin = await isAdmin(request.auth.uid);

		// Non-admins may only see Public attachments.
		if (userIsAdmin) {
			return files;
		}

		return files.filter((file: any) => file?.Public === true);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
