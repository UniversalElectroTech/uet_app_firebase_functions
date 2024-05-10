export class Customer {
	public simproId: string;
	public companyName: string;
	public givenName: string;
	public familyName: string;

	constructor({
		simproId,
		companyName,
		givenName,
		familyName,
	}: {
		simproId: string;
		companyName: string;
		givenName: string;
		familyName: string;
	}) {
		this.simproId = simproId;
		this.companyName = companyName;
		this.givenName = givenName;
		this.familyName = familyName;
	}

	static fromMap(customerData: { [key: string]: any }): Customer {
		return new Customer({
			simproId: customerData["ID"].toString(),
			companyName: customerData["CompanyName"],
			givenName: customerData["GivenName"],
			familyName: customerData["FamilyName"],
		});
	}

	static readonly empty: Customer = new Customer({
		simproId: "",
		companyName: "",
		givenName: "",
		familyName: "",
	});

	copyWith({
		simproId,
		companyName,
		givenName,
		familyName,
	}: {
		simproId?: string;
		companyName?: string;
		givenName?: string;
		familyName?: string;
	}): Customer {
		return new Customer({
			simproId: simproId ?? this.simproId,
			companyName: companyName ?? this.companyName,
			givenName: givenName ?? this.givenName,
			familyName: familyName ?? this.familyName,
		});
	}
}
