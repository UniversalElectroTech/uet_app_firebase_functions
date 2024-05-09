import { Timestamp } from "firebase-admin/firestore";

export class Booking {
	public timeStart: Timestamp;
	public timeFinish: Timestamp;

	constructor({
		timeStart,
		timeFinish,
	}: {
		timeStart: Timestamp;
		timeFinish: Timestamp;
	}) {
		this.timeStart = timeStart;
		this.timeFinish = timeFinish;
	}

	static fromFirebaseMap(map: { [key: string]: any }): Booking {
		return new Booking({
			timeStart: map["startTime"] as Timestamp,
			timeFinish: map["finishTime"] as Timestamp,
		});
	}
}
