export class AdditionalHazard {
	constructor(
		public hazardDescription: string = "",
		public control: string = ""
	) {}

	static fromMap(map: Record<string, any>): AdditionalHazard {
		return new AdditionalHazard(
			map["hazardDescription"] ?? "",
			map["control"] ?? ""
		);
	}

	toMap(): Record<string, any> {
		return {
			hazardDescription: this.hazardDescription,
			control: this.control,
		};
	}
}
