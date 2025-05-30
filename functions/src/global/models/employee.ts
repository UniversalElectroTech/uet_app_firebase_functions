enum SecurityGroup {
	admin = "admin",
}

enum EmployeeStatus {
	initial = "initial",
	loading = "loading",
	failure = "failure",
}

export class Employee {
	firebaseDocId: string | null;
	simproId: string;
	name: string;
	email: string;
	mobile: string;
	securityGroup: string | null;
	isAccountDeleted: boolean;
	status: EmployeeStatus;

	constructor({
		firebaseDocId,
		simproId,
		name,
		email,
		mobile,
		securityGroup,
		isAccountDeleted,
		status = EmployeeStatus.initial,
	}: {
		firebaseDocId: string | null;
		simproId: string;
		name: string;
		email: string;
		mobile: string;
		securityGroup: string | null;
		isAccountDeleted: boolean;
		status?: EmployeeStatus;
	}) {
		this.firebaseDocId = firebaseDocId;
		this.simproId = simproId;
		this.name = name;
		this.email = email;
		this.mobile = mobile;
		this.securityGroup = securityGroup;
		this.isAccountDeleted = isAccountDeleted;
		this.status = status;
	}

	static fromSimproMap(employeeData: Record<string, any>): Employee {
		const primaryContact = employeeData["PrimaryContact"];

		return new Employee({
			firebaseDocId: null,
			simproId: employeeData["ID"].toString(),
			name: employeeData["Name"].toString(),
			email: primaryContact["Email"].toString(),
			mobile: primaryContact["CellPhone"].toString(),
			securityGroup: null,
			isAccountDeleted: false,
		});
	}

	static fromFirebaseMap(employeeData: Record<string, any>): Employee {
		return new Employee({
			firebaseDocId: employeeData["firebaseDocId"],
			simproId: employeeData["simproId"].toString(),
			name: employeeData["name"].toString(),
			email: employeeData["email"].toString(),
			mobile: employeeData["mobile"].toString(),
			securityGroup: employeeData["securityGroup"],
			isAccountDeleted: employeeData["isAccountDeleted"] ?? false,
		});
	}

	static empty: Employee = new Employee({
		firebaseDocId: null,
		simproId: "",
		name: "",
		email: "",
		mobile: "",
		securityGroup: null,
		isAccountDeleted: false,
	});

	copyWith({
		firebaseDocId,
		simproId,
		name,
		email,
		mobile,
		securityGroup,
		isAccountDeleted,
		status,
	}: {
		firebaseDocId?: string | null;
		simproId?: string;
		name?: string;
		email?: string;
		mobile?: string;
		securityGroup?: string | null;
		isAccountDeleted?: boolean;
		status?: EmployeeStatus;
	}): Employee {
		return new Employee({
			firebaseDocId: firebaseDocId ?? this.firebaseDocId,
			simproId: simproId ?? this.simproId,
			name: name ?? this.name,
			email: email ?? this.email,
			mobile: mobile ?? this.mobile,
			securityGroup: securityGroup ?? this.securityGroup,
			isAccountDeleted: isAccountDeleted ?? this.isAccountDeleted,
			status: status ?? this.status,
		});
	}

	isAdmin(): boolean {
		return this.securityGroup === SecurityGroup.admin;
	}
}
