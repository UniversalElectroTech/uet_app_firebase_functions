import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { DocumentData, FieldValue, getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";

export async function submitSwmsSignaturesHandler(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const documentIds: string[] = Array.isArray(request.data?.documentIds)
			? request.data.documentIds
					.map((id: unknown) => String(id).trim())
					.filter(Boolean)
			: [];
		const signedName = String(request.data?.signedName ?? "").trim();
		const signatureBase64 = String(request.data?.signatureBase64 ?? "");
		const batchId = String(request.data?.batchId ?? "").trim();
		const gpsCoordinates =
			typeof request.data?.gpsCoordinates === "string"
				? request.data.gpsCoordinates
				: null;
		const gpsPermissionGranted = request.data?.gpsPermissionGranted === true;
		const deviceInfo =
			typeof request.data?.deviceInfo === "string"
				? request.data.deviceInfo
				: null;
		const appVersion =
			typeof request.data?.appVersion === "string"
				? request.data.appVersion
				: null;
		const viewedDocumentIds = Array.isArray(request.data?.viewedDocumentIds)
			? request.data.viewedDocumentIds.map((id: unknown) => String(id))
			: [];

		if (!documentIds.length || !signedName || !signatureBase64 || !batchId) {
			throw new HttpsError(
				"invalid-argument",
				"documentIds, signedName, signatureBase64 and batchId are required."
			);
		}

		const employeeId = request.auth.uid;
		const userSnap = await getFirestore()
			.collection("app_users")
			.doc(employeeId)
			.get();
		const employeeName = userSnap.exists
			? String(userSnap.data()?.name ?? "").trim()
			: "";

		if (!employeeName) {
			throw new HttpsError(
				"failed-precondition",
				"Employee profile is missing a name."
			);
		}

		const docsById = new Map<string, DocumentData>();
		for (const id of documentIds) {
			const snap = await getFirestore().collection("swms_documents").doc(id).get();
			if (snap.exists) {
				docsById.set(snap.id, snap.data()!);
			}
		}

		const signaturesCollection = getFirestore().collection("swms_signatures");
		const writtenIds: string[] = [];

		for (const documentId of documentIds) {
			const document = docsById.get(documentId);
			if (!document) {
				throw new HttpsError(
					"not-found",
					`SWMS document not found: ${documentId}`
				);
			}
			if (document.status !== "active") {
				throw new HttpsError(
					"failed-precondition",
					`SWMS document is not active: ${documentId}`
				);
			}

			const ref = signaturesCollection.doc();
			await ref.set({
				documentId,
				documentName: document.name ?? "",
				documentVersion: document.version ?? 1,
				employeeId,
				employeeName,
				signedName,
				signatureBase64,
				signedAt: FieldValue.serverTimestamp(),
				invalidatedAt: null,
				invalidatedBy: null,
				invalidateReason: null,
				batchId,
				gpsCoordinates,
				gpsPermissionGranted,
				deviceInfo,
				appVersion,
				viewedDocumentIds,
			});
			writtenIds.push(documentId);
		}

		return { success: true, signedDocumentIds: writtenIds };
	} catch (error) {
		return handleAxiosError(error);
	}
}
