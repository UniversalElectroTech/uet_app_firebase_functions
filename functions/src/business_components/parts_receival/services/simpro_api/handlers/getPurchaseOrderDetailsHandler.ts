import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { simproApiService } from "../../../../../global/services/simpro_api/simproApiService";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { getSiteRoute } from "../../../../../global/services/simpro_api/config/routes";
import { canAccessPartsReceival } from "../../../../../global/firebase_functions/canAccessPartsReceival";
import {
	getJobStatusRoute,
	getPartsReceivalJobRoute,
	getVendorOrderRoute,
	getVendorOrderStatusRoute,
} from "../config/routes";

type StatusInfo = { name: string; color: string | null };

type JobLabelDetails = {
	jobNumber: string;
	jobName: string;
	jobAddress: string;
	jobStatus: string;
	jobStatusColor: string | null;
};

export async function getPurchaseOrderDetailsHandler(
	request: CallableRequest
) {
	try {
		await assertPartsReceivalAccess(request);

		const { poNumber }: { poNumber: string } = request.data;

		if (!poNumber || !/^\d+$/.test(poNumber)) {
			throw new HttpsError(
				"failed-precondition",
				"A valid purchase order number is required."
			);
		}

		return await getPurchaseOrderDetails(poNumber);
	} catch (error: any) {
		if (error instanceof HttpsError) {
			throw error;
		}
		return handleAxiosError(error);
	}
}

export async function getJobLabelDetailsHandler(request: CallableRequest) {
	try {
		await assertPartsReceivalAccess(request);

		const { jobNumber }: { jobNumber: string } = request.data;

		if (!jobNumber || !/^\d+$/.test(jobNumber)) {
			throw new HttpsError(
				"failed-precondition",
				"A valid job number is required."
			);
		}

		const jobDetails = await getJobLabelDetails(jobNumber);

		return {
			poNumber: "",
			poStatus: "",
			poStatusColor: null,
			includesPoDetails: false,
			...jobDetails,
		};
	} catch (error: any) {
		if (error instanceof HttpsError) {
			throw error;
		}
		return handleAxiosError(error);
	}
}

async function assertPartsReceivalAccess(request: CallableRequest) {
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	if (!(await canAccessPartsReceival(request.auth.uid))) {
		throw new HttpsError(
			"permission-denied",
			"You do not have permission to access Parts Receival."
		);
	}
}

async function getPurchaseOrderDetails(poNumber: string) {
	let vendorOrderResponse;
	try {
		vendorOrderResponse = await simproApiService.get(
			getVendorOrderRoute(poNumber)
		);
	} catch (error: any) {
		if (error?.response?.status === 404) {
			throw new HttpsError("not-found", "Purchase order not found.");
		}
		throw error;
	}

	const vendorOrder = vendorOrderResponse.data;
	const assignedJobId = vendorOrder?.AssignedTo?.Job;

	if (!assignedJobId) {
		throw new HttpsError(
			"failed-precondition",
			"Purchase order is not linked to a job."
		);
	}

	const jobDetails = await getJobLabelDetails(assignedJobId.toString());
	const poStatus = await resolveStatus(vendorOrder, "vendorOrder");

	return {
		poNumber: vendorOrder.ID.toString(),
		poStatus: poStatus.name,
		poStatusColor: poStatus.color,
		includesPoDetails: true,
		...jobDetails,
	};
}

async function getJobLabelDetails(jobNumber: string): Promise<JobLabelDetails> {
	let jobResponse;
	try {
		jobResponse = await simproApiService.get(
			getPartsReceivalJobRoute(jobNumber)
		);
	} catch (error: any) {
		if (error?.response?.status === 404) {
			throw new HttpsError("not-found", "Job not found.");
		}
		throw error;
	}

	const jobData = jobResponse.data;
	const siteId = jobData?.Site?.ID?.toString();

	if (!siteId) {
		throw new HttpsError(
			"failed-precondition",
			"Job site details could not be found."
		);
	}

	const siteResponse = await simproApiService.get(getSiteRoute(siteId));
	const siteData = siteResponse.data;
	const addressJson = siteData?.Address || {};

	const addressParts = [
		addressJson.Address,
		addressJson.City,
		addressJson.PostalCode,
		addressJson.State,
	].filter((part) => part != null && String(part).trim() !== "");

	const jobStatus = await resolveStatus(jobData, "job");

	return {
		jobNumber: jobData.ID.toString(),
		jobName: jobData.Name?.toString() ?? "",
		jobAddress: addressParts.join(", "),
		jobStatus: jobStatus.name,
		jobStatusColor: jobStatus.color,
	};
}

async function resolveStatus(
	entity: any,
	type: "job" | "vendorOrder"
): Promise<StatusInfo> {
	const statusName = entity?.Status?.Name;
	const stage = entity?.Stage;
	const name =
		statusName != null && String(statusName).trim() !== ""
			? statusName.toString()
			: stage != null && String(stage).trim() !== ""
			? stage.toString()
			: "";

	let color = normalizeHexColor(entity?.Status?.Color);

	if (!color && entity?.Status?.ID != null) {
		color = await fetchStatusColor(entity.Status.ID.toString(), type);
	}

	return { name, color };
}

async function fetchStatusColor(
	statusId: string,
	type: "job" | "vendorOrder"
): Promise<string | null> {
	try {
		const route =
			type === "job"
				? getJobStatusRoute(statusId)
				: getVendorOrderStatusRoute(statusId);
		const response = await simproApiService.get(route);
		return normalizeHexColor(response.data?.Color);
	} catch {
		return null;
	}
}

function normalizeHexColor(value: unknown): string | null {
	if (value == null) {
		return null;
	}

	const raw = String(value).trim();
	if (raw === "") {
		return null;
	}

	const withHash = raw.startsWith("#") ? raw : `#${raw}`;
	if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(withHash)) {
		return withHash.toUpperCase();
	}

	return null;
}
