import { BASE_URL } from "./config/config";

// GET ================================================================
export const getToken: string = "https://uet.simprosuite.com/oauth2/token";

export function getEmployeesRoute(): string {
	return `${BASE_URL}/employees/?columns=ID,Name,PrimaryContact`;
}

export function getJobSectionsRoute(simproJobId: string): string {
	return `${BASE_URL}/jobs/${simproJobId}?display=all&columns=Sections`;
}

export function getSitesRoute(siteAddressIds: string): string {
	return `${BASE_URL}/sites/?columns=ID,Address,PrimaryContact&ID=in(${siteAddressIds})`;
}
// ====================================================================

// POST ===============================================================
export function postJobAttachmentsRoute(simproJobId: string): string {
	return `${BASE_URL}/jobs/${simproJobId}/attachments/files/`;
}

export function postOneOffItemRoute(
	jobId: string,
	sectionId: string,
	costCenterId: string
): string {
	return `${BASE_URL}/jobs/${jobId}/sections/${sectionId}/costCenters/${costCenterId}/oneOffs/`;
}
// ====================================================================

// DELETE =============================================================
// ====================================================================

// PATCH ==============================================================
export function patchJobStageRoute(simproJobId: string): string {
	return `${BASE_URL}/jobs/${simproJobId}`;
}
// ====================================================================
