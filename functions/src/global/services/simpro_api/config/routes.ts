import { BASE_URL, DEFAULT_PAGE, DEFAULT_RETURN_COUNT } from "./config";

// GET ================================================================
export const getToken: string = "https://uet.simprosuite.com/oauth2/token";

export function getJobDetailsRoute(simproJobId: string) {
	return `${BASE_URL}/jobs/${simproJobId}?columns=ID,Name,Customer,Site,SiteContact,Notes,Stage`;
}

export function getEmployeesRoute(): string {
	return `${BASE_URL}/employees/?columns=ID,Name,PrimaryContact`;
}

export function getJobSectionsRoute(simproJobId: string): string {
	return `${BASE_URL}/jobs/${simproJobId}?display=all&columns=Sections`;
}

export function getSitesRoute(
	siteAddressIds: string,
	returnCount: number = DEFAULT_RETURN_COUNT,
	page: number = DEFAULT_PAGE
): string {
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
