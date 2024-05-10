export class Employee {
	constructor(
		public firebaseDocId: string | null,
		public simproId: string,
		public name: string,
		public email: string,
		public mobile: string
	) {}

	static fromSimproMap(employeeData: any): Employee {
		const primaryContact = employeeData["PrimaryContact"];
		return new Employee(
			null,
			employeeData["ID"].toString(),
			employeeData["Name"].toString(),
			primaryContact["Email"].toString(),
			primaryContact["CellPhone"].toString()
		);
	}

	static fromFirebaseMap(employeeData: any): Employee {
		return new Employee(
			employeeData["firebaseDocId"],
			employeeData["simproID"].toString(),
			employeeData["name"].toString(),
			employeeData["email"].toString(),
			employeeData["mobile"].toString()
		);
	}

	static empty(): Employee {
		return new Employee(null, "", "", "", "");
	}

	copyWith({
		firebaseDocId,
		simproId,
		name,
		email,
		mobile,
	}: Partial<Employee>): Employee {
		return new Employee(
			firebaseDocId ?? this.firebaseDocId,
			simproId ?? this.simproId,
			name ?? this.name,
			email ?? this.email,
			mobile ?? this.mobile
		);
	}

	toMap(): any {
		return {
			simproID: this.simproId,
			name: this.name,
			email: this.email,
			mobile: this.mobile,
		};
	}
}
