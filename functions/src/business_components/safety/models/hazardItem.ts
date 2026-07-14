export class HazardItem {
	constructor(
		public description: string = "",
		public selected: boolean = false,
		public control: string = ""
	) {}

	static fromMap(map: Record<string, any>): HazardItem {
		return new HazardItem(
			map["description"] ?? "",
			map["selected"] ?? false,
			map["control"] ?? ""
		);
	}

	toMap(): Record<string, any> {
		return {
			description: this.description,
			selected: this.selected,
			control: this.control,
		};
	}

	copyWith(updates: {
		description?: string;
		selected?: boolean;
		control?: string;
	}): HazardItem {
		return new HazardItem(
			updates.description ?? this.description,
			updates.selected ?? this.selected,
			updates.control ?? this.control
		);
	}
}
