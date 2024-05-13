import { CallableRequest } from "firebase-functions/v2/https";

export async function getGreeting(request: CallableRequest): Promise<any> {
	return "Hello, world!";
}
