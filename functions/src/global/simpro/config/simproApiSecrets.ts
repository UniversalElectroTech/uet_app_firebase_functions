import { defineSecret } from "firebase-functions/params";

// UET SimPRO Secret
const clientId = defineSecret("SIMPRO_CLIENT_ID");
const clientSecret = defineSecret("SIMPRO_CLIENT_SECRET");
