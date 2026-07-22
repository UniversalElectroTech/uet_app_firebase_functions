import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { serializeSwmsDocument } from "../helpers/swmsSerialize";

export async function getSwmsDocumentsHandler(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const includeArchived = request.data?.includeArchived === true;
		const includeDeleted = request.data?.includeDeleted === true;

		const snapshot = await getFirestore()
			.collection("swms_documents")
			.orderBy("name")
			.get();

		const documents = snapshot.docs
			.map((doc) => serializeSwmsDocument(doc.id, doc.data()))
			.filter((doc) => {
				if (doc.status === "active") return true;
				if (includeArchived && doc.status === "archived") return true;
				if (includeDeleted && doc.status === "deleted") return true;
				return false;
			});

		return { documents };
	} catch (error) {
		return handleAxiosError(error);
	}
}
