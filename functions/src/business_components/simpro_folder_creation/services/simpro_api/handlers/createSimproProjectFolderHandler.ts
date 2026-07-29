import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import {
	createQuoteAttachmentsRoute,
	createSimproJobFolderRoute,
} from "../config/routes";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";

export async function createSimproProjectFolderHandler(
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
			folderName,
			isQuote,
			parentFolderId,
		}: {
			simproId: string;
			folderName: string;
			isQuote: boolean;
			parentFolderId?: number | null;
		} = request.data;

		if (!simproId || !folderName) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		return await createSimproProjectFolder(
			simproId,
			folderName,
			isQuote,
			parentFolderId ?? null
		);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function createSimproProjectFolder(
	simproId: string,
	folderName: string,
	isQuote: boolean,
	parentFolderId: number | null
) {
	const payload: Record<string, unknown> = { Name: folderName };
	if (parentFolderId != null) {
		// Simpro accepts Parent (preferred) and still documents ParentID.
		payload.Parent = parentFolderId;
		payload.ParentID = parentFolderId;
	}

	const route = isQuote
		? createQuoteAttachmentsRoute(simproId)
		: createSimproJobFolderRoute(simproId);

	const response = await simproApiService.post(route, payload);
	return response.data;
}
