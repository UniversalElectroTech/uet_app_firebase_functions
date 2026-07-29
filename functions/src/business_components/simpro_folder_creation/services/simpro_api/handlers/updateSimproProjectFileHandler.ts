import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import {
	getSimproJobFileRoute,
	getSimproQuoteFileRoute,
	updateSimproJobFileRoute,
	updateSimproQuoteFileRoute,
} from "../config/routes";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";

async function assertCanAccessFile(
	uid: string,
	simproId: string,
	isQuote: boolean,
	fileId: string
) {
	const userIsAdmin = await isAdmin(uid);
	if (userIsAdmin) return;

	const route = isQuote
		? getSimproQuoteFileRoute(simproId, fileId)
		: getSimproJobFileRoute(simproId, fileId);
	const response = await simproApiService.get(route);
	if (response.data?.Public !== true) {
		throw new HttpsError(
			"permission-denied",
			"You do not have permission to modify this file."
		);
	}
}

export async function updateSimproProjectFileHandler(request: CallableRequest) {
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
			filename,
			folderId,
		}: {
			simproId: string;
			isQuote: boolean;
			fileId: string;
			filename?: string;
			folderId?: number | null;
		} = request.data;

		const hasFilename = typeof filename === "string" && filename.trim() !== "";
		const hasFolderUpdate = Object.prototype.hasOwnProperty.call(
			request.data,
			"folderId"
		);

		if (!simproId || !fileId || (!hasFilename && !hasFolderUpdate)) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		await assertCanAccessFile(request.auth.uid, simproId, isQuote, fileId);

		const payload: Record<string, unknown> = {};
		if (hasFilename) {
			payload.Filename = filename!.trim();
		}
		if (hasFolderUpdate) {
			payload.Folder = folderId ?? null;
		}

		const route = isQuote
			? updateSimproQuoteFileRoute(simproId, fileId)
			: updateSimproJobFileRoute(simproId, fileId);

		const response = await simproApiService.patch(route, payload);
		return response.data ?? { success: true };
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
