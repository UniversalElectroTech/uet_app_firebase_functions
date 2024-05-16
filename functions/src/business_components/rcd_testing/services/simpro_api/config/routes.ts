import {
	BASE_URL,
	DEFAULT_PAGE,
	DEFAULT_RETURN_COUNT,
} from "../../../../../global/services/simpro_api/config/config";
import { RCD_TEST_CUSTOM_FIELD_ID } from "./config";

// GET ================================================================
export function getRcdProgressJobsRoute(
	companySimproId: string,
	returnCount: number = DEFAULT_RETURN_COUNT,
	page: number = DEFAULT_PAGE
): string {
	return `${BASE_URL}/jobs/?columns=ID,Name,Customer,Site,SiteContact,Notes,Stage,CustomFields&CustomFields.CustomField.ID=${RCD_TEST_CUSTOM_FIELD_ID}&CustomFields.Value=Yes&Stage=Progress&Customer.Id=${companySimproId}?pageSize=${returnCount}&page=${page}`;
}

export function getRcdCompleteJobsRoute(
	companySimproId: string,
	returnCount: number = DEFAULT_RETURN_COUNT,
	page: number = DEFAULT_PAGE
): string {
	return `${BASE_URL}/jobs/?columns=ID,Name,Customer,Site,SiteContact,Notes,Stage,CustomFields&CustomFields.CustomField.ID=${RCD_TEST_CUSTOM_FIELD_ID}&CustomFields.Value=Yes&Stage=Complete&Customer.Id=${companySimproId}?pageSize=${returnCount}&page=${page}`;
}

export function getRcdJobCustomersRoute(
	returnCount: number = DEFAULT_RETURN_COUNT,
	page: number = DEFAULT_PAGE
): string {
	return `${BASE_URL}/jobs/?columns=Customer&CustomFields.CustomField.ID=${RCD_TEST_CUSTOM_FIELD_ID}&CustomFields.Value=Yes&Stage=in(Progress,Complete)`;
}
// ====================================================================

// POST ===============================================================
// ====================================================================

// DELETE =============================================================
// ====================================================================

// PATCH ==============================================================
// ====================================================================
