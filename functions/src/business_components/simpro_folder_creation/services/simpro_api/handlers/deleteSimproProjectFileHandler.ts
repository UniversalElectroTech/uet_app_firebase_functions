import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import {
	deleteSimproJobFileRoute,
	deleteSimproQuoteFileRoute,
	getSimproJobFileRoute,
	getSimproQuoteFileRoute,
} from "../config/routes";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";

export async function deleteSimproProjectFileHandler(request: CallableRequest) {
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

		const userIsAdmin = await isAdmin(request.auth.uid);
		if (!userIsAdmin) {
			const metaRoute = isQuote
				? getSimproQuoteFileRoute(simproId, fileId)
				: getSimproJobFileRoute(simproId, fileId);
			const meta = await simproApiService.get(metaRoute);
			if (meta.data?.Public !== true) {
				throw new HttpsError(
					"permission-denied",
					"You do not have permission to delete this file."
				);
			}
		}

		const route = isQuote
			? deleteSimproQuoteFileRoute(simproId, fileId)
			: deleteSimproJobFileRoute(simproId, fileId);

		await simproApiService.delete(route);
		return { success: true };
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
