// src/business_components/cctv_report/models/CctvLogin.ts
export enum CctvAccountType {
	user = "user",
	admin = "admin",
}

export class CctvLogin {
	public id: string;
	public accountType?: CctvAccountType | null;
	public userName: string;
	public password: string;
	public pattern?: number[] | null;

	constructor({
		id = "",
		accountType,
		userName = "",
		password = "",
		pattern,
	}: {
		id?: string;
		accountType?: CctvAccountType | null;
		userName?: string;
		password?: string;
		pattern?: number[] | null;
		errorMessage?: string;
	}) {
		this.id = id;
		this.accountType = accountType;
		this.userName = userName;
		this.password = password;
		this.pattern = pattern;
	}

	static fromFirebaseMap(map: { [key: string]: any }): CctvLogin {
		const id = map["id"] as string;
		const accountType = map["accountType"] as CctvAccountType | null;
		const userName = map["userName"] as string;
		const password = map["password"] as string;
		const pattern = map["pattern"]
			? (Array.from(map["pattern"]) as number[])
			: null;

		return new CctvLogin({
			id,
			accountType,
			userName,
			password,
			pattern,
		});
	}

	toMap(): { [key: string]: any } {
		return {
			id: this.id,
			accountType: this.accountType,
			userName: this.userName,
			password: this.password,
			pattern: this.pattern,
		};
	}

	copyWith({
		id,
		accountType,
		userName,
		password,
		pattern,
	}: {
		id?: string;
		accountType?: CctvAccountType | null;
		userName?: string;
		password?: string;
		pattern?: number[] | null;
	}): CctvLogin {
		return new CctvLogin({
			id: id ?? this.id,
			accountType: accountType ?? this.accountType ?? null,
			userName: userName ?? this.userName,
			password: password ?? this.password,
			pattern: pattern ?? this.pattern ?? null,
		});
	}

	static empty = new CctvLogin({
		id: "",
		accountType: CctvAccountType.user,
		pattern: null,
		userName: "",
		password: "",
	});
}
