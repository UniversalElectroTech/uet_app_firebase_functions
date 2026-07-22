import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import {
	DocumentData,
	FieldValue,
	getFirestore,
} from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { serializeSwmsSignature } from "../helpers/swmsSerialize";

export async function submitSwmsSignaturesHandler(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const documentIds: string[] = Array.isArray(request.data?.documentIds)
			? [
					...new Set(
						(request.data.documentIds as unknown[])
							.map((id) => String(id).trim())
							.filter((id) => id.length > 0)
					),
				]
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

		const db = getFirestore();
		const employeeId = request.auth.uid;

		const docRefs = documentIds.map((id) =>
			db.collection("swms_documents").doc(id)
		);
		const [userSnap, docSnaps] = await Promise.all([
			db.collection("app_users").doc(employeeId).get(),
			db.getAll(...docRefs),
		]);

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
		for (const snap of docSnaps) {
			if (snap.exists) {
				docsById.set(snap.id, snap.data()!);
			}
		}

		const signedAt = new Date();
		const batch = db.batch();
		const created: Array<{ id: string; data: DocumentData }> = [];

		for (const documentId of documentIds) {
			const document = docsById.get(documentId);
			if (!document) {
				throw new HttpsError(
					"not-found",
					`SWMS document not found: ${documentId}`
				);
			}
			// Legacy docs may omit status — treat missing as active.
			const status = String(document.status ?? "active");
			if (status !== "active") {
				throw new HttpsError(
					"failed-precondition",
					`SWMS document is not active: ${documentId}`
				);
			}

			const ref = db.collection("swms_signatures").doc();
			const payload: DocumentData = {
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
			};
			batch.set(ref, payload);
			created.push({
				id: ref.id,
				data: {
					...payload,
					// Callable response can't include FieldValue; use wall-clock approx.
					signedAt,
				},
			});
		}

		await batch.commit();

		return {
			success: true,
			signedDocumentIds: documentIds,
			signatures: created.map(({ id, data }) =>
				serializeSwmsSignature(id, data)
			),
		};
	} catch (error) {
		return handleAxiosError(error);
	}
}
