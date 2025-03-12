import { CallableRequest, onCall } from "firebase-functions/v2/https";

import { addVehicleHandler } from "../handlers/addVehicleHandler";
import { returnVehicleLogHandler } from "../handlers/returnVehicleLogHandler";
import { updateVehicleHandler } from "../handlers/updateVehicleHandler";
import { getEmployeeVehicleLogsHandler } from "../handlers/getEmployeeVehicleLogsHandler";
import { getAllVehiclesHandler } from "../handlers/getVehiclesHandler";
import { deleteVehicleHandler } from "../handlers/deleteVehicleHandler";
import { addVehicleLogHandler } from "../handlers/addVehicleLogHandler";
import { getVehicleHandler } from "../handlers/getVehicleHandler";
import { getAllEmployeesHandler } from "../handlers/getAllEmployees";

// Returns all RCD testing complete jobs from the SimproAPI
exports.getAllEmployees = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getAllEmployeesHandler(request);
	}
);

// Add a new callable function for returning vehicles
exports.returnVehicle = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await returnVehicleLogHandler(request);
	}
);

// Add a new callable function for updating vehicles
exports.updateVehicle = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await updateVehicleHandler(request);
	}
);

// Add a new callable function for getting employee vehicle logs
exports.getEmployeeVehicleLogs = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getEmployeeVehicleLogsHandler(request);
	}
);

// Add a new callable function for getting all vehicles
exports.getAllVehicles = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getAllVehiclesHandler(request);
	}
);

// Add a new callable function for deleting vehicles
exports.deleteVehicle = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await deleteVehicleHandler(request);
	}
);

// Add a new callable function for adding vehicle logs
exports.addVehicleLog = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await addVehicleLogHandler(request);
	}
);

// Add a new callable function for adding vehicle logs
exports.addVehicle = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await addVehicleHandler(request);
	}
);

// Add a new callable function for adding vehicle logs
exports.getVehicle = onCall(
	{ timeoutSeconds: 10, maxInstances: 1, enforceAppCheck: true },
	async (request: CallableRequest) => {
		return await getVehicleHandler(request);
	}
);
