export class PpeItem {
	constructor(public name: string, public selected: boolean = false) {}

	static fromMap(map: Record<string, any>): PpeItem {
		return new PpeItem(map["name"] ?? "", map["selected"] ?? false);
	}

	toMap(): Record<string, any> {
		return {
			name: this.name,
			selected: this.selected,
		};
	}
}
