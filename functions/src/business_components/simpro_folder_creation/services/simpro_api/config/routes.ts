import { BASE_URL } from "../../../../../global/services/simpro_api/config/config";

// GET ================================================================
export function getSimproFolderJobsRoute(
	employeeSimproId: string,
	dateThisWeek: string
): string {
	return `${BASE_URL}/schedules/?Date=between(${dateThisWeek})&Staff.ID=${employeeSimproId}&Type=in(job,quote)`;
}

export function getSimproJobFoldersRoute(simproJobId: string): string {
	return `${BASE_URL}/jobs/${simproJobId}/attachments/folders/?columns=ID,Name,Parent,ParentID&pageSize=250`;
}

export function getSimproQuoteFoldersRoute(simproQuoteId: string): string {
	return `${BASE_URL}/quotes/${simproQuoteId}/attachments/folders/?columns=ID,Name,Parent,ParentID&pageSize=250`;
}

export function getSimproJobFilesRoute(simproJobId: string): string {
	return `${BASE_URL}/jobs/${simproJobId}/attachments/files/?columns=ID,Filename,Folder,MimeType,FileSizeBytes,DateAdded,Public,Email&pageSize=250`;
}

export function getSimproQuoteFilesRoute(simproQuoteId: string): string {
	return `${BASE_URL}/quotes/${simproQuoteId}/attachments/files/?columns=ID,Filename,Folder,MimeType,FileSizeBytes,DateAdded,Public,Email&pageSize=250`;
}

export function getSimproJobFileRoute(
	simproJobId: string,
	fileId: string
): string {
	return `${BASE_URL}/jobs/${simproJobId}/attachments/files/${fileId}`;
}

export function getSimproQuoteFileRoute(
	simproQuoteId: string,
	fileId: string
): string {
	return `${BASE_URL}/quotes/${simproQuoteId}/attachments/files/${fileId}`;
}
// ====================================================================

// POST ===============================================================
export function createSimproJobFolderRoute(simproJobId: string): string {
	return `${BASE_URL}/jobs/${simproJobId}/attachments/folders/`;
}

export function createQuoteAttachmentsRoute(simproQuoteId: string): string {
	return `${BASE_URL}/quotes/${simproQuoteId}/attachments/folders/`;
}

export function createSimproJobFileRoute(simproJobId: string): string {
	return `${BASE_URL}/jobs/${simproJobId}/attachments/files/`;
}

export function createSimproQuoteFileRoute(simproQuoteId: string): string {
	return `${BASE_URL}/quotes/${simproQuoteId}/attachments/files/`;
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

export function deleteSimproJobFileRoute(
	simproJobId: string,
	fileId: string
): string {
	return `${BASE_URL}/jobs/${simproJobId}/attachments/files/${fileId}`;
}

export function deleteSimproQuoteFileRoute(
	simproQuoteId: string,
	fileId: string
): string {
	return `${BASE_URL}/quotes/${simproQuoteId}/attachments/files/${fileId}`;
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

export function updateSimproJobFileRoute(
	simproJobId: string,
	fileId: string
): string {
	return `${BASE_URL}/jobs/${simproJobId}/attachments/files/${fileId}`;
}

export function updateSimproQuoteFileRoute(
	simproQuoteId: string,
	fileId: string
): string {
	return `${BASE_URL}/quotes/${simproQuoteId}/attachments/files/${fileId}`;
}
// ====================================================================
