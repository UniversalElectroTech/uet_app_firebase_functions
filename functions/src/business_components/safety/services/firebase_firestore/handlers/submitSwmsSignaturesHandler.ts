import { createHash } from "crypto";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import {
	DocumentData,
	FieldValue,
	getFirestore,
} from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { serializeSwmsSignature } from "../helpers/swmsSerialize";

function parseDocumentContentHashes(raw: unknown): Map<string, string> {
	const hashes = new Map<string, string>();
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		return hashes;
	}
	for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
		const documentId = String(key).trim();
		const hash = String(value ?? "")
			.trim()
			.toLowerCase();
		if (!documentId || !/^[a-f0-9]{64}$/.test(hash)) continue;
		hashes.set(documentId, hash);
	}
	return hashes;
}

async function hashStoredSwmsPdf(
	storagePath: string
): Promise<string | null> {
	const path = storagePath.trim();
	if (!path) return null;
	try {
		const [bytes] = await getStorage().bucket().file(path).download();
		return createHash("sha256").update(bytes).digest("hex");
	} catch {
		return null;
	}
}

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
		const batchId = String(
			request.data?.batchId ?? request.data?.envelopeId ?? ""
		).trim();
		const envelopeId = String(
			request.data?.envelopeId ?? request.data?.batchId ?? ""
		).trim() || batchId;
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
		const clientHashes = parseDocumentContentHashes(
			request.data?.documentContentHashes
		);

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

		// Prefer server-side SHA-256 of the stored PDF; fall back to a valid
		// client hash so seal binding still works if Storage download fails.
		const contentHashes = new Map<string, string | null>();
		await Promise.all(
			documentIds.map(async (documentId) => {
				const document = docsById.get(documentId);
				if (!document) {
					contentHashes.set(documentId, null);
					return;
				}
				const serverHash = await hashStoredSwmsPdf(
					String(document.storagePath ?? "")
				);
				contentHashes.set(
					documentId,
					serverHash ?? clientHashes.get(documentId) ?? null
				);
			})
		);

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

			const documentContentHash = contentHashes.get(documentId) ?? null;
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
				envelopeId,
				documentContentHash,
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
