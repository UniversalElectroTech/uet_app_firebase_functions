export class Customer {
	constructor(public simproId: string, public name: string) {}

	static empty = new Customer("", "");

	static fromMap(customerData: any): Customer {
		const simproId = customerData["ID"] ?? "";
		const companyName = customerData["CompanyName"] ?? "";
		const givenName = customerData["GivenName"] ?? "";
		const familyName = customerData["FamilyName"] ?? "";

		let name = "";

		if (companyName !== "") {
			name = companyName;
		} else {
			name = `${givenName} ${familyName}`;
		}

		return new Customer(simproId, name);
	}

	toMap(): any {
		return {
			id: this.simproId,
			name: this.name,
		};
	}

	copyWith(simproId?: string, name?: string): Customer {
		return new Customer(simproId ?? this.simproId, name ?? this.name);
	}
}
