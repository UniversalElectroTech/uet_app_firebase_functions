import { BASE_URL, DEFAULT_PAGE, DEFAULT_RETURN_COUNT } from "./config";

// GET ================================================================
export const getToken: string = "https://uet.simprosuite.com/oauth2/token";

export function getScheduledJobsRoute(
	employeeSimproId: string,
	dateThisWeek: string
): string {
	return `${BASE_URL}/schedules/?Date=between(${dateThisWeek})&Staff.ID=${employeeSimproId}&Type=in(job)`;
}

export function getJobDetailsRoute(simproJobId: string): string {
	return `${BASE_URL}/jobs/${simproJobId}?columns=ID,Name,Customer,Site,SiteContact,Notes,Stage`;
}

export function getQuoteDetailsRoute(simproQuoteId: string): string {
	return `${BASE_URL}/quotes/${simproQuoteId}?columns=ID,Name,Customer,Site,SiteContact,Notes,Stage`;
}

export function getJobsDetailsRoute(simproJobIds: Array<string>): string {
	let simproIds: string = "";

	for (let index = 0; index < simproJobIds.length; index++) {
		const simproId: string = simproJobIds[index];

		if (index < simproJobIds.length) {
			simproIds = `${simproIds}${simproId}`;
			if (index < simproJobIds.length - 1) {
				simproIds += ",";
			}
		}
	}

	return `${BASE_URL}/jobs/?columns=ID,Name,Customer,Site,SiteContact,Notes,Stage&ID=in(${simproIds})`;
}

export function getQuotesDetailsRoute(simproQuoteIds: Array<string>): string {
	let simproIds: string = "";

	for (let index = 0; index < simproQuoteIds.length; index++) {
		const simproId: string = simproQuoteIds[index];

		if (index < simproQuoteIds.length) {
			simproIds = `${simproIds}${simproId}`;
			if (index < simproQuoteIds.length - 1) {
				simproIds += ",";
			}
		}
	}

	return `${BASE_URL}/quotes/?columns=ID,Name,Customer,Site,SiteContact,Notes,Stage&ID=in(${simproIds})`;
}

export function getEmployeesRoute(): string {
	return `${BASE_URL}/employees/?columns=ID,Name,PrimaryContact`;
}

export function getContractorsRoute(): string {
	return `${BASE_URL}/contractors/?columns=ID,Name,PrimaryContact`;
}

export function getFilteredSuppliersRoute(supplierName: string): string {
	return `${BASE_URL}/vendors/?Name=${supplierName}%25`;
}

export function getJobSectionsRoute(simproJobId: string): string {
	return `${BASE_URL}/jobs/${simproJobId}?display=all&columns=Sections`;
}

export function getSitesRoute(
	siteAddressIds: string,
	returnCount: number = DEFAULT_RETURN_COUNT,
	page: number = DEFAULT_PAGE
): string {
	return `${BASE_URL}/sites/?pageSize=${returnCount}&columns=ID,Address,PrimaryContact&ID=in(${siteAddressIds})`;
}

export function getSiteRoute(siteId: string): string {
	return `${BASE_URL}/sites/${siteId}?columns=ID,Name,Address,PrimaryContact`;
}
// ====================================================================

// POST ===============================================================
export function postJobSection(simproJobId: string): string {
	return `${BASE_URL}/jobs/${simproJobId}/sections/`;
}

export function postUetMaintenanceCostCentre(
	simproJobId: string,
	simproSectionId: string
): string {
	return `${BASE_URL}/jobs/${simproJobId}/sections/${simproSectionId}/costCenters/`;
}

export function postjobNoteRoute(simproJobId: string): string {
	return `${BASE_URL}/jobs/${simproJobId}/notes/`;
}

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
