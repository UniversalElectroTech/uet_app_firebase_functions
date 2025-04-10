export class Booking {
	constructor(public timeStart: Date, public timeFinish: Date) {}

	static fromFirebaseMap(map: any): Booking {
		return new Booking(
			new Date(map["startTime"].seconds * 1000), // Convert Firestore Timestamp to Date
			new Date(map["finishTime"].seconds * 1000) // Convert Firestore Timestamp to Date
		);
	}

	toFirebaseMap(): any {
		return {
			startTime: { seconds: Math.floor(this.timeStart.getTime() / 1000) },
			finishTime: { seconds: Math.floor(this.timeFinish.getTime() / 1000) },
		};
	}

	toFrontEndMap(): any {
		return {
			startTime: this.timeStart.toISOString(),
			finishTime: this.timeFinish.toISOString(),
		};
	}

	getDateAndTime(): string {
		const dateTimeStart = this.timeStart;
		const dateTimeFinish = this.timeFinish;
		return `${this.formatDate(dateTimeStart)} ${this.formatTime(
			dateTimeStart
		)} - ${this.formatTime(dateTimeFinish)}`;
	}

	private formatDate(date: Date): string {
		// Implement your date formatting logic here
		return date.toLocaleDateString(); // Example implementation
	}

	private formatTime(date: Date): string {
		// Implement your time formatting logic here
		return date.toLocaleTimeString(); // Example implementation
	}
}
