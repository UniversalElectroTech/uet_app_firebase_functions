export class SiteContact {
	constructor(
		public simproId: string,
		public givenName: string,
		public familyName: string,
		public email: string,
		public workPhone: string,
		public cellPhone: string
	) {}

	static empty = new SiteContact("", "", "", "", "", "");

	static fromMap(json: any): SiteContact {
		let simproId = "";
		let givenName = "";
		let familyName = "";
		let email = "";
		let workPhone = "";
		let cellPhone = "";

		if (json["Contact"]) {
			simproId = json["Contact"]["ID"] ?? "";
			givenName = json["Contact"]["GivenName"] ?? "";
			familyName = json["Contact"]["FamilyName"] ?? "";
			email = json["Contact"]["Email"] ?? "";
		}

		workPhone = json["WorkPhone"] ?? "";
		cellPhone = json["CellPhone"] ?? "";

		return new SiteContact(
			simproId,
			givenName,
			familyName,
			email,
			workPhone,
			cellPhone
		);
	}

	toFirebaseMap(): any {
		return {
			ID: this.simproId,
			GivenName: this.givenName,
			FamilyName: this.familyName,
			Email: this.email,
			WorkPhone: this.workPhone,
			CellPhone: this.cellPhone,
		};
	}

	toFrontEndMap(): any {
		return {
			simproId: this.simproId,
			givenName: this.givenName,
			familyName: this.familyName,
			email: this.email,
			workPhone: this.workPhone,
			cellPhone: this.cellPhone,
		};
	}
}
