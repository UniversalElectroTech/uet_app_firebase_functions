import { DistributionBoard } from "../../models/distributionBoard";
import { rcdCount } from "./helper_functions";

export function calculateCustomerCost(
	dbs: DistributionBoard[],
	isSharedJob: boolean,
	customerId: string
): number | null {
	// Count rcds and remove any that were not testable
	const costedRcds = rcdCount(dbs);

	switch (customerId) {
		// H&N Perry
		case "598":
			return calculateHnPerryCost(isSharedJob, costedRcds);
		default:
			return null;
	}
}

function calculateHnPerryCost(
	isSharedJob: boolean,
	costedRcds: number
): number {
	let totalCost = 0;

	if (costedRcds <= 10) {
		totalCost = 91; // Base cost for the first 10 RCDs
	} else {
		const additionalRcds = costedRcds - 10;
		totalCost = 91 + Math.floor(additionalRcds / 10) * 50; // Calculate cost for additional RCDs
	}

	// Apply cost cap if total cost exceeds $199 per tenancy
	if (totalCost > 199) {
		totalCost = 199;
	}

	// Split cost if job is shared
	if (isSharedJob) {
		totalCost = totalCost / 2;
	}

	return totalCost;
}
