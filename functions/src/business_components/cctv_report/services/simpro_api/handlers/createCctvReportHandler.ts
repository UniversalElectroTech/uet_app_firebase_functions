import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { getSimproJob } from "../../../../../global/services/simpro_api/handlers/getJobDetailsHandler";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { CctvCamera } from "../../../models/cctvCamera";
import { CctvNvr } from "../../../models/cctvNvr";
import { CctvLogin } from "../../../models/cctvLogin";
import { CctvNote } from "../../../models/cctvNote";
import { CctvJob } from "../../../models/cctvJob";

export async function createCctvReportHandler(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	const userId = request.auth.uid;
	const { simproId } = request.data; // Get SimproId from request data

	if (!simproId) {
		throw new HttpsError("invalid-argument", "SimproId is required.");
	}

	try {
		const cctvReport = await createCctvReport(simproId, userId);

		return cctvReport;
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

export async function createCctvReport(
	simproId: any,
	createdBy: any
): Promise<CctvJob> {
	// Create a new CCTV report in Firestore
	const db = getFirestore();

	const simproJob = await getSimproJob(simproId);

	let newCctvJob = new CctvJob({
		simproId: simproId,
		status: "progress",
		name: simproJob.name,
		dateCreated: new Date(),
		address: simproJob.getAddress(),
		createdBy: createdBy,
		cameras: [CctvCamera.empty],
		nvrs: [CctvNvr.empty],
		logins: [CctvLogin.empty],
		notes: [CctvNote.empty],
	});

	const mapData = newCctvJob.toFirebaseMap();

	const reportRef = await db.collection("cctv_reports").add(mapData);

	newCctvJob = newCctvJob.copyWith({ firebaseId: reportRef.id });

	return newCctvJob;
}
