import { SiteContact } from "./siteContact";

export class Site {
	public simproId: string;
	public address: string;
	public city: string;
	public state: string;
	public postalCode: string;
	public country: string;
	public contact: SiteContact;

	constructor({
		simproId,
		address,
		city,
		state,
		postalCode,
		country,
		contact,
	}: {
		simproId: string;
		address: string;
		city: string;
		state: string;
		postalCode: string;
		country: string;
		contact: SiteContact;
	}) {
		this.simproId = simproId;
		this.address = address;
		this.city = city;
		this.state = state;
		this.postalCode = postalCode;
		this.country = country;
		this.contact = contact;
	}

	static empty(): Site {
		return new Site({
			simproId: "",
			address: "",
			city: "",
			state: "",
			postalCode: "",
			country: "",
			contact: SiteContact.empty(),
		});
	}

	static fromMap(data: { [key: string]: any }): Site {
		if (!data || Object.keys(data).length === 0) {
			return Site.empty();
		}
		const addressJson = data["Address"] as { [key: string]: any };
		return new Site({
			simproId: data["ID"].toString(),
			address: addressJson["Address"].toString(),
			city: addressJson["City"].toString(),
			state: addressJson["State"].toString(),
			postalCode: addressJson["PostalCode"].toString(),
			country: addressJson["Country"].toString(),
			contact: SiteContact.fromMap(data["PrimaryContact"]),
		});
	}
}
