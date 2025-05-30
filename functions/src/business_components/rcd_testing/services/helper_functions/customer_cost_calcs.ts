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

	// Base cost for the first 10 RCDs
	const baseCost = 91;

	// Calculate cost for additional RCDs
	const extraBlocks = Math.ceil((costedRcds - 10) / 10);
	totalCost = baseCost + (costedRcds > 10 ? extraBlocks * 50 : 0);

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
