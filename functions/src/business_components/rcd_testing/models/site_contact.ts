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
		return new SiteContact(
			json["Contact"]["ID"].toString(),
			json["Contact"]["GivenName"].toString(),
			json["Contact"]["FamilyName"].toString(),
			json["Contact"]["Email"].toString(),
			json["WorkPhone"].toString(),
			json["CellPhone"].toString()
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
