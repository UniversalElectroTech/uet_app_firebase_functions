export class TeamMember {
	constructor(
		public name: string = "",
		public signatureBytes: string = "",
		public isSupervisor: boolean = false
	) {}

	static fromMap(map: Record<string, any>): TeamMember {
		return new TeamMember(
			map["name"] ?? "",
			map["signatureBytes"] ?? "",
			map["isSupervisor"] ?? false
		);
	}

	toMap(): Record<string, any> {
		return {
			name: this.name,
			signatureBytes: this.signatureBytes,
			isSupervisor: this.isSupervisor,
		};
	}

	copyWith(updates: {
		name?: string;
		signatureBytes?: string;
		isSupervisor?: boolean;
	}): TeamMember {
		return new TeamMember(
			updates.name ?? this.name,
			updates.signatureBytes ?? this.signatureBytes,
			updates.isSupervisor ?? this.isSupervisor
		);
	}
}
