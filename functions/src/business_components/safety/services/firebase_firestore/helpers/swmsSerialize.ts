import { DocumentData, Timestamp } from "firebase-admin/firestore";

export function serializeDate(value: unknown): string | null {
	if (!value) return null;
	if (value instanceof Timestamp) {
		return value.toDate().toISOString();
	}
	if (value instanceof Date) {
		return value.toISOString();
	}
	if (typeof value === "string") {
		return value;
	}
	return null;
}

export function serializeSwmsDocument(id: string, data: DocumentData) {
	return {
		id,
		name: data.name ?? "",
		fileName: data.fileName ?? "",
		downloadUrl: data.downloadUrl ?? "",
		storagePath: data.storagePath ?? "",
		createdAt: serializeDate(data.createdAt),
		updatedAt: serializeDate(data.updatedAt),
		createdBy: data.createdBy ?? null,
		status: data.status ?? "active",
		version: data.version ?? 1,
		replacesDocumentId: data.replacesDocumentId ?? null,
	};
}

export function serializeSwmsSignature(id: string, data: DocumentData) {
	return {
		id,
		documentId: data.documentId ?? "",
		documentName: data.documentName ?? "",
		documentVersion: data.documentVersion ?? 1,
		employeeId: data.employeeId ?? "",
		employeeName: data.employeeName ?? "",
		signedName: data.signedName ?? null,
		signatureBase64: data.signatureBase64 ?? "",
		signedAt: serializeDate(data.signedAt),
		invalidatedAt: serializeDate(data.invalidatedAt),
		invalidatedBy: data.invalidatedBy ?? null,
		invalidateReason: data.invalidateReason ?? null,
		batchId: data.batchId ?? data.envelopeId ?? "",
		envelopeId: data.envelopeId ?? data.batchId ?? "",
		documentContentHash: data.documentContentHash ?? null,
		gpsCoordinates: data.gpsCoordinates ?? null,
		gpsPermissionGranted: data.gpsPermissionGranted === true,
		deviceInfo: data.deviceInfo ?? null,
		appVersion: data.appVersion ?? null,
		viewedDocumentIds: Array.isArray(data.viewedDocumentIds)
			? data.viewedDocumentIds.map((v: unknown) => String(v))
			: [],
	};
}

export function serializeSwmsSettings(data: DocumentData) {
	return {
		weeks: data.weeks ?? 0,
		months: data.months ?? 6,
		years: data.years ?? 0,
		nextReSignDate: serializeDate(data.nextReSignDate),
		updatedAt: serializeDate(data.updatedAt),
		updatedBy: data.updatedBy ?? null,
	};
}

export function defaultSwmsSettings() {
	const now = new Date();
	const next = new Date(now);
	next.setMonth(next.getMonth() + 6);
	return {
		weeks: 0,
		months: 6,
		years: 0,
		nextReSignDate: next,
		updatedAt: now,
		updatedBy: null as string | null,
	};
}

export function isSignatureCurrentlyValid(
	signature: DocumentData,
	settings: {
		nextReSignDate?: Date | null;
	}
): boolean {
	if (signature.invalidatedAt) return false;

	const signedAtRaw = signature.signedAt;
	const signedAt =
		signedAtRaw instanceof Timestamp
			? signedAtRaw.toDate()
			: signedAtRaw instanceof Date
				? signedAtRaw
				: null;
	if (!signedAt) return false;

	const nextReSignDate = settings.nextReSignDate ?? null;
	if (nextReSignDate) {
		const due = new Date(
			nextReSignDate.getFullYear(),
			nextReSignDate.getMonth(),
			nextReSignDate.getDate()
		);
		const today = new Date();
		const todayDate = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate()
		);
		const isReSignDue = todayDate.getTime() >= due.getTime();
		if (isReSignDue) {
			return signedAt.getTime() >= nextReSignDate.getTime();
		}
	}

	return true;
}
