import { BASE_URL } from "../../../../../global/services/simpro_api/config/config";

// GET ================================================================
export function getVendorOrderRoute(vendorOrderId: string): string {
	return `${BASE_URL}/vendorOrders/${vendorOrderId}?columns=ID,Stage,Status,AssignedTo`;
}

export function getPartsReceivalJobRoute(simproJobId: string): string {
	return `${BASE_URL}/jobs/${simproJobId}?columns=ID,Name,Site,Stage,Status`;
}

export function getVendorOrderStatusRoute(statusId: string): string {
	return `${BASE_URL}/setup/statuses/vendorOrders/${statusId}`;
}

export function getJobStatusRoute(statusId: string): string {
	return `${BASE_URL}/setup/statuses/projects/${statusId}`;
}
// ====================================================================
