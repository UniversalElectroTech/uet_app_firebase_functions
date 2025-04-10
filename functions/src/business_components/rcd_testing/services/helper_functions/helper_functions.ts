import { DistributionBoard } from "../../models/distributionBoard";

// Helper function to count RCDs
export function rcdCount(dbs: DistributionBoard[]): number {
	return dbs.reduce(
		(count, db) => count + db.rcds.filter((rcd) => rcd.isTestable).length,
		0
	);
}
