import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { handleAxiosError } from "../../../../global/services/helper_functions/errorHandling";
import { createSimproJobFolderRoute } from "../config/routes";
import { simproApiService } from "../../../../global/services/simpro_api/simproApiService";

export async function createSimproJobFolder(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const {
			simproJobId,
			folderName,
		}: { simproJobId: string; folderName: string } = request.data;

		if (!simproJobId || !folderName) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		const response = await simproApiService.post(
			createSimproJobFolderRoute(simproJobId),
			{ Name: folderName }
		);
		return response.data;
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
