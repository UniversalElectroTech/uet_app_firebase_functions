import { BASE_URL } from "../../../../global/services/simpro_api/config/config";

// GET ================================================================
export function getSimproFolderJobsRoute(
	employeeSimproId: string,
	dateThisWeek: string
): string {
	return `${BASE_URL}/schedules/?Date=between(${dateThisWeek})&Staff.ID=${employeeSimproId}&Type=in(job,quote)`;
}

export function getSimproJobFoldersRoute(simproJobId: string): string {
	return `${BASE_URL}/jobs/${simproJobId}/attachments/folders/`;
}

export function getSimproQuoteFoldersRoute(simproQuoteId: string): string {
	return `${BASE_URL}/quotes/${simproQuoteId}/attachments/folders/`;
}

// ====================================================================

// POST ===============================================================
export function createSimproJobFolderRoute(simproJobId: string): string {
	return `${BASE_URL}/jobs/${simproJobId}/attachments/folders/`;
}

export function createQuoteAttachmentsRoute(simproQuoteId: string): string {
	return `${BASE_URL}/quotes/${simproQuoteId}/attachments/folders/`;
}
// ====================================================================

// DELETE =============================================================
export function deleteSimproJobFolderRoute(
	simproJobId: string,
	folderId: string
): string {
	return `${BASE_URL}/jobs/${simproJobId}/attachments/folders/${folderId}`;
}

export function deleteSimproQuoteFolderRoute(
	simproQuoteId: string,
	folderId: string
): string {
	return `${BASE_URL}/quotes/${simproQuoteId}/attachments/folders/${folderId}`;
}
// ====================================================================

// PATCH ==============================================================
export function updateSimproJobFolderNameRoute(
	simproJobId: string,
	folderId: string
): string {
	return `${BASE_URL}/jobs/${simproJobId}/attachments/folders/${folderId}`;
}

export function updateSimproQuoteFolderNameRoute(
	simproQuoteId: string,
	folderId: string
): string {
	return `${BASE_URL}/quotes/${simproQuoteId}/attachments/folders/${folderId}`;
}
// ====================================================================
