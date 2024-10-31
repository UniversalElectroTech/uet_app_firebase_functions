import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../../../../global/services/simpro_api/simproApiService";
import { handleAxiosError } from "../../../../global/services/helper_functions/errorHandling";
import { deleteSimproJobFolderRoute } from "../config/routes";

export async function deleteSimproJobFolder(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const { simproJobId, folderId }: { simproJobId: string; folderId: string } =
			request.data;

		if (!simproJobId || !folderId) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		await simproApiService.delete(
			deleteSimproJobFolderRoute(simproJobId, folderId)
		);
		return { success: true };
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
