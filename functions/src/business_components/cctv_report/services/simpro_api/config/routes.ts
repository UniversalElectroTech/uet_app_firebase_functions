import { BASE_URL } from "../../../../../global/services/simpro_api/config/config";

// GET ================================================================
export function getCctvReportJobsRoute(employeeSimproId: string): string {
	return `${BASE_URL}/jobs/?columns=ID,Name,Stage&Technicians.ID=${employeeSimproId}&Stage=in(Progress,Complete)`;
}
// ====================================================================

// POST ===============================================================
// ====================================================================

// DELETE =============================================================
// ====================================================================

// PATCH ==============================================================
// ====================================================================
