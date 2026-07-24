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
		// List/status views only need metadata. Signature images are large and
		// will exceed callable payload limits once many people have signed.
		const includeSignatureImage =
			request.data?.includeSignatureImage === true;

		let query: Query = getFirestore().collection("swms_signatures");
		if (documentId) {
			query = query.where("documentId", "==", documentId);
		}

		const snapshot = await query.get();
		const signatures = snapshot.docs.map((doc) => {
			const serialized = serializeSwmsSignature(doc.id, doc.data());
			if (includeSignatureImage) return serialized;
			return { ...serialized, signatureBase64: "" };
		});

		return { signatures };
	} catch (error) {
		return handleAxiosError(error);
	}
}
