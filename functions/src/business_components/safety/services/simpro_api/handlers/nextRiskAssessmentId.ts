import { getFirestore } from "firebase-admin/firestore";

/**
 * Allocates the next sequential Risk Assessment ID (e.g. RA-00001).
 * Uses a Firestore counter so multiple assessments under one Simpro job
 * remain uniquely identifiable.
 */
export async function nextRiskAssessmentId(): Promise<string> {
	const db = getFirestore();
	const counterRef = db.collection("counters").doc("risk_assessments");

	const nextNumber = await db.runTransaction(async (transaction) => {
		const snap = await transaction.get(counterRef);
		const current = snap.exists ? Number(snap.data()?.value ?? 0) : 0;
		const next = current + 1;
		transaction.set(counterRef, { value: next }, { merge: true });
		return next;
	});

	return `RA-${String(nextNumber).padStart(5, "0")}`;
}
