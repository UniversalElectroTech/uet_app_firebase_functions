import { onCall } from "firebase-functions/v2/https";
import { getGreeting } from "./global/test/testFunction";

// Test Functions
exports.testFunction = onCall(async () => getGreeting);
