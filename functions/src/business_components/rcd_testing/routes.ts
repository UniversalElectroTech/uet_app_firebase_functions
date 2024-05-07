import {
	RCD_TEST_CUSTOM_FIELD_ID,
	BASE_URL,
} from "../../global/simpro/config/config";

export function rcdProgressJobsPath(
	companySimproId: string,
	returnCount: string,
	page: string
): string {
	return `${BASE_URL}/jobs/?columns=ID,Name,Customer,Site,SiteContact,Notes,Stage,CustomFields&CustomFields.CustomField.ID=${RCD_TEST_CUSTOM_FIELD_ID}&CustomFields.Value=Yes&Stage=Progress&Customer.Id=${companySimproId}?pageSize=${returnCount}&page=${page}`;
}

export function rcdCompleteJobsPath(
	companySimproId: string,
	returnCount: string,
	page: string
): string {
	return `${BASE_URL}/jobs/?columns=ID,Name,Customer,Site,SiteContact,Notes,Stage,CustomFields&CustomFields.CustomField.ID=${RCD_TEST_CUSTOM_FIELD_ID}&CustomFields.Value=Yes&Stage=Complete&Customer.Id=${companySimproId}?pageSize=${returnCount}&page=${page}`;
}

export function sitesPath(siteAddressIds: string): string {
	return `${BASE_URL}/sites/?columns=ID,Address,PrimaryContact&ID=in(${siteAddressIds})`;
}

export const rcdJobCustomers: string = `/jobs/?columns=Customer&CustomFields.CustomField.ID=${RCD_TEST_CUSTOM_FIELD_ID}&CustomFields.Value=Yes&Stage=in(Progress,Complete)`;

export function jobSections(simproJobId: string): string {
	return `${BASE_URL}/jobs/${simproJobId}?display=all&columns=Sections`;
}

export function addOneOffItem(
	jobId: string,
	sectionId: string,
	costCenterId: string
): string {
	return `${BASE_URL}/jobs/${jobId}/sections/${sectionId}/costCenters/${costCenterId}/oneOffs/`;
}

export function updateJobStage(simproJobId: string): string {
	return `${BASE_URL}/jobs/${simproJobId}`;
}
