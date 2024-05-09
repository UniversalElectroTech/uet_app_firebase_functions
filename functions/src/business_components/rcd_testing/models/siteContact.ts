export class SiteContact {
	public simproId: string;
	public givenName: string;
	public familyName: string;
	public email: string;
	public workPhone: string;
	public cellPhone: string;

	constructor({
		simproId,
		givenName,
		familyName,
		email,
		workPhone,
		cellPhone,
	}: {
		simproId: string;
		givenName: string;
		familyName: string;
		email: string;
		workPhone: string;
		cellPhone: string;
	}) {
		this.simproId = simproId;
		this.givenName = givenName;
		this.familyName = familyName;
		this.email = email;
		this.workPhone = workPhone;
		this.cellPhone = cellPhone;
	}

	static empty(): SiteContact {
		return new SiteContact({
			simproId: "",
			givenName: "",
			familyName: "",
			email: "",
			workPhone: "",
			cellPhone: "",
		});
	}

	static fromMap(json: { [key: string]: any }): SiteContact {
		return new SiteContact({
			simproId: json["ID"].toString(),
			givenName: json["GivenName"].toString(),
			familyName: json["FamilyName"].toString(),
			email: json["Email"].toString(),
			workPhone: json["WorkPhone"].toString(),
			cellPhone: json["CellPhone"].toString(),
		});
	}
}
