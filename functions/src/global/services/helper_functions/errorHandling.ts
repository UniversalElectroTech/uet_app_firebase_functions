import axios, { AxiosError } from "axios";
import { HttpsError } from "firebase-functions/v2/https";

// Helper function to handle Axios errors
export function handleAxiosError(error: any) {
	if (axios.isAxiosError(error)) {
		const axiosError = error as AxiosError<{
			errors: Array<{ message: string }>;
		}>;
		const serverErrorMessage = axiosError.response?.data?.errors[0]?.message;
		const errorMessage =
			serverErrorMessage || axiosError.message || "An error occurred";
		throw new HttpsError("internal", errorMessage);
	} else if (error instanceof Error) {
		throw new HttpsError("internal", error.message || "An error occurred");
	} else {
		throw error;
	}
}
