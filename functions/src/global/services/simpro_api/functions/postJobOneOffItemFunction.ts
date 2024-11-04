import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import {
	postOneOffItemRoute,
	getJobSectionsRoute,
	postJobSection,
	postUetMaintenanceCostCentre as postUetMaintenanceCostCenter,
} from "../config/routes";
import { simproApiService } from "../simproApiService";
import { handleAxiosError } from "../../helper_functions/errorHandling";
import { AxiosResponse } from "axios";
import { MAINTENANCE_COST_CENTRE_ID } from "../config/config";

// adds one of item to job
export async function postJobOneOffItem(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be " + "called while authenticated."
		);
	}
	try {
		const {
			simproJobId,
			description,
			cost,
		}: { simproJobId: string; description: string; cost: number } =
			request.data;

		// Check if all required parameters have been received
		if (!simproJobId || !description || !cost) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		// Get section / costCenter ID
		const getResponse: AxiosResponse = await simproApiService.get(
			getJobSectionsRoute(simproJobId)
		);

		var sectionId;
		var costCenterId;

		// Parse JSON response and extract sectionID and costCenterID
		const sections: Array<any> = getResponse.data["Sections"];

		if (sections.length == 0) {
			// Create Job Section
			const postSectionResponse: AxiosResponse = await simproApiService.post(
				postJobSection(simproJobId),
				{}
			);

			sectionId = postSectionResponse.data["ID"].toString();

			// Create Cost Centre
			const postCostCentreResponse: AxiosResponse = await simproApiService.post(
				postUetMaintenanceCostCenter(simproJobId, sectionId),
				{ CostCenter: MAINTENANCE_COST_CENTRE_ID }
			);

			costCenterId = postCostCentreResponse.data["ID"].toString();
		} else {
			const section = sections[0];
			sectionId = section["ID"].toString();
			costCenterId = section["CostCenters"][0]["ID"].toString();
		}

		// Prepare payload
		const payload = [
			{
				Type: "Labor",
				Total: { Qty: 1 },
				SellPrice: cost,
				Description: description,
			},
		];

		// Put one off item in Simpro job
		const response: AxiosResponse = await simproApiService.put(
			postOneOffItemRoute(simproJobId, sectionId, costCenterId),
			payload
		);

		// Return response data
		return response.data;
	} catch (error: any) {
		return handleAxiosError(error);
	}
}
