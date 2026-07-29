import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import {
	updateSimproJobFolderNameRoute,
	updateSimproQuoteFolderNameRoute,
} from "../config/routes";

export async function updateSimproProjectFolderHandler(
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
			newFolderName,
			updatedFolderName,
			parentFolderId,
			isQuote,
		}: {
			simproId: string;
			folderId: string | number;
			newFolderName?: string;
			updatedFolderName?: string;
			parentFolderId?: number | null;
			isQuote: boolean;
		} = request.data;

		const folderName = (newFolderName ?? updatedFolderName)?.trim();
		const hasParentUpdate = Object.prototype.hasOwnProperty.call(
			request.data,
			"parentFolderId"
		);

		if (!simproId || folderId == null || (!folderName && !hasParentUpdate)) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		const payload: Record<string, unknown> = {};
		if (folderName) {
			payload.Name = folderName;
		}
		if (hasParentUpdate) {
			// Prefer Parent; include ParentID for compatibility with older Simpro behaviour.
			payload.Parent = parentFolderId ?? null;
			payload.ParentID = parentFolderId ?? null;
		}

		const route = isQuote
			? updateSimproQuoteFolderNameRoute(simproId, String(folderId))
			: updateSimproJobFolderNameRoute(simproId, String(folderId));

		const response = await simproApiService.patch(route, payload);
		return response.data ?? { success: true };
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
