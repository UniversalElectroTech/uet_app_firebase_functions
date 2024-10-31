import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../../../../global/services/simpro_api/simproApiService";
import { handleAxiosError } from "../../../../global/services/helper_functions/errorHandling";
import { postSimproJobFolderNameRoute } from "../config/routes";

export async function postSimproJobFolder(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const {
			simproJobId,
			folderId,
			newFolderName,
		}: { simproJobId: string; folderId: string; newFolderName: string } =
			request.data;

		if (!simproJobId || !folderId || !newFolderName) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		const response = await simproApiService.patch(
			postSimproJobFolderNameRoute(simproJobId, folderId),
			{ name: newFolderName }
		);
		return response.data;
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
