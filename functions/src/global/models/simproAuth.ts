export class SimproAuth {
	accessToken: string;
	expirationTime: number;

	constructor(accessToken: string, expirationTime: number) {
		this.accessToken = accessToken;
		this.expirationTime = expirationTime;
	}

	static fromSimproMap(map: {
		access_token: string;
		expiration_time: number;
	}): SimproAuth {
		return new SimproAuth(
			map.access_token,
			Date.now() + map.expiration_time * 1000 // Convert seconds to milliseconds
		);
	}
}
