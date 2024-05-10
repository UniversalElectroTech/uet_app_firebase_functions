// SimproAuth model
export class SimproAuth {
	accessToken: string;
	expirationTime: Date;

	constructor(accessToken: string, expirationTime: Date) {
		this.accessToken = accessToken;
		this.expirationTime = expirationTime;
	}

	static fromSimproMap(map: {
		access_token: string;
		expires_in: number;
	}): SimproAuth {
		return new SimproAuth(
			map.access_token,
			new Date(Date.now() + map.expires_in * 1000) // Convert seconds to milliseconds
		);
	}
}
