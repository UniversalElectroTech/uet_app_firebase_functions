import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { storage } from "firebase-admin";
import { getDownloadURL } from "firebase-admin/storage";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { serializeSwmsDocument } from "../helpers/swmsSerialize";

const MAX_PDF_BYTES = 20 * 1024 * 1024;

export async function addSwmsDocumentHandler(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		if (!(await isAdmin(request.auth.uid))) {
			throw new HttpsError(
				"permission-denied",
				"Admin access is required to add SWMS documents."
			);
		}

		const name = String(request.data?.name ?? "").trim();
		const fileName = String(request.data?.fileName ?? "").trim();
		const pdfBase64 = String(request.data?.pdfBase64 ?? "");
		const replacesDocumentId =
			typeof request.data?.replacesDocumentId === "string"
				? request.data.replacesDocumentId
				: null;
		const version = Number(request.data?.version ?? 1);

		if (!name || !fileName || !pdfBase64) {
			throw new HttpsError(
				"invalid-argument",
				"name, fileName and pdfBase64 are required."
			);
		}

		const fileBytes = Buffer.from(pdfBase64, "base64");
		if (fileBytes.length > MAX_PDF_BYTES) {
			throw new HttpsError(
				"invalid-argument",
				"PDF must be 20 MB or smaller."
			);
		}

		const docRef = getFirestore().collection("swms_documents").doc();
		const storagePath = `safety/swms/${docRef.id}/${fileName}`;
		const file = storage().bucket().file(storagePath);

		await file.save(fileBytes, {
			metadata: { contentType: "application/pdf" },
		});
		const downloadUrl = await getDownloadURL(file);

		await docRef.set({
			name,
			fileName,
			downloadUrl,
			storagePath,
			createdAt: FieldValue.serverTimestamp(),
			updatedAt: FieldValue.serverTimestamp(),
			createdBy: request.auth.uid,
			status: "active",
			version: Number.isFinite(version) && version > 0 ? version : 1,
			replacesDocumentId,
		});

		const snapshot = await docRef.get();
		return {
			document: serializeSwmsDocument(docRef.id, snapshot.data() ?? {
				name,
				fileName,
				downloadUrl,
				storagePath,
				createdBy: request.auth.uid,
				status: "active",
				version,
				replacesDocumentId,
			}),
		};
	} catch (error) {
		return handleAxiosError(error);
	}
}
