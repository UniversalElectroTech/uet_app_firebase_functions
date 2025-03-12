import {
	BASE_URL,
	DEFAULT_PAGE,
	DEFAULT_RETURN_COUNT,
} from "../../../../../global/services/simpro_api/config/config";
import { RCD_TEST_CUSTOM_FIELD_ID } from "./config";

// GET ================================================================
export function getRcdProgressJobsRoute(
	employeeSimproId: string,
	companySimproId: string,
	returnCount: number = DEFAULT_RETURN_COUNT,
	page: number = DEFAULT_PAGE
): string {
	return `${BASE_URL}/jobs/?pageSize=${returnCount}&page=${page}&columns=ID,Name,Customer,Site,SiteContact,Notes,Stage,CustomFields&CustomFields.CustomField.ID=${RCD_TEST_CUSTOM_FIELD_ID}&CustomFields.Value=Yes&Technicians.ID=${employeeSimproId}&Stage=Progress&Customer.Id=${companySimproId}`;
}

export function getRcdCompleteJobsRoute(
	employeeSimproId: string,
	companySimproId: string,
	returnCount: number = DEFAULT_RETURN_COUNT,
	page: number = DEFAULT_PAGE
): string {
	return `${BASE_URL}/jobs/?pageSize=${returnCount}&page=${page}&columns=ID,Name,Customer,Site,SiteContact,Notes,Stage,CustomFields&CustomFields.CustomField.ID=${RCD_TEST_CUSTOM_FIELD_ID}&CustomFields.Value=Yes&Technicians.ID=${employeeSimproId}&Stage=Complete&Customer.Id=${companySimproId}`;
}

export function getRcdJobCustomersRoute(
	employeeSimproId: string,
	returnCount: number = DEFAULT_RETURN_COUNT,
	page: number = DEFAULT_PAGE
): string {
	return `${BASE_URL}/jobs/?columns=Customer&CustomFields.CustomField.ID=${RCD_TEST_CUSTOM_FIELD_ID}&CustomFields.Value=Yes&Technicians.ID=${employeeSimproId}&Stage=in(Pending,Complete,Progress)`;
}
// ====================================================================

// POST ===============================================================
// ====================================================================

// DELETE =============================================================
// ====================================================================

// PATCH ==============================================================
// ====================================================================
