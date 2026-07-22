import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, Query } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { serializeSwmsSignature } from "../helpers/swmsSerialize";

export async function getSwmsSignaturesHandler(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const documentId =
			typeof request.data?.documentId === "string"
				? request.data.documentId.trim()
				: "";

		let query: Query = getFirestore().collection("swms_signatures");
		if (documentId) {
			query = query.where("documentId", "==", documentId);
		}

		const snapshot = await query.get();
		const signatures = snapshot.docs.map((doc) =>
			serializeSwmsSignature(doc.id, doc.data())
		);

		return { signatures };
	} catch (error) {
		return handleAxiosError(error);
	}
}
