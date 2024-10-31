import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../../../../global/services/simpro_api/simproApiService";
import { handleAxiosError } from "../../../../global/services/helper_functions/errorHandling";
import { getSimproJobFoldersRoute } from "../config/routes";

export async function getSimproJobFolders(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const { simproJobId }: { simproJobId: string } = request.data;

		if (!simproJobId) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		const response = await simproApiService.get(
			getSimproJobFoldersRoute(simproJobId)
		);
		return response.data;
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
