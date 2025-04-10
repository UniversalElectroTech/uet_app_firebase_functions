import { SiteContact } from "./site_contact";

export class Site {
	constructor(
		public simproId: string,
		public address: string,
		public city: string,
		public state: string,
		public postalCode: string,
		public country: string,
		public contact: SiteContact
	) {}

	static empty = new Site("", "", "", "", "", "", SiteContact.empty);

	static fromMap(data: any): Site {
		const addressJson = data["Address"] || {};
		return new Site(
			data["ID"].toString(),
			addressJson["Address"].toString(),
			addressJson["City"].toString(),
			addressJson["State"].toString(),
			addressJson["PostalCode"].toString(),
			addressJson["Country"].toString(),
			SiteContact.fromMap(data["PrimaryContact"])
		);
	}

	toFrontEndMap(): any {
		return {
			simproId: this.simproId,
			address: this.address,
			city: this.city,
			state: this.state,
			postalCode: this.postalCode,
			country: this.country,
			contact: this.contact.toFrontEndMap(),
		};
	}
}
