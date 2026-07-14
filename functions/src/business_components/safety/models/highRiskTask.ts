export class HighRiskTask {
	constructor(
		public number: string,
		public description: string,
		public selected: boolean = false,
		public relevantSwms: string = "",
		public otherSwms: string = ""
	) {}

	static fromMap(map: Record<string, any>): HighRiskTask {
		return new HighRiskTask(
			map["number"] ?? "",
			map["description"] ?? "",
			map["selected"] ?? false,
			map["relevantSwms"] ?? "",
			map["otherSwms"] ?? ""
		);
	}

	toMap(): Record<string, any> {
		return {
			number: this.number,
			description: this.description,
			selected: this.selected,
			relevantSwms: this.relevantSwms,
			otherSwms: this.otherSwms,
		};
	}

	copyWith(updates: {
		number?: string;
		description?: string;
		selected?: boolean;
		relevantSwms?: string;
		otherSwms?: string;
	}): HighRiskTask {
		return new HighRiskTask(
			updates.number ?? this.number,
			updates.description ?? this.description,
			updates.selected ?? this.selected,
			updates.relevantSwms ?? this.relevantSwms,
			updates.otherSwms ?? this.otherSwms
		);
	}
}
