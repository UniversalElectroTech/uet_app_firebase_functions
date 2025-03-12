import * as globalSimproEvents from "./global/services/simpro_api/events/globalSimproEvents";
import * as rcdTestingSimproEvents from "./business_components/rcd_testing/services/simpro_api/events/rcdTestingSimproEvents";
import * as cctvReportSimproEvents from "./business_components/cctv_report/services/simpro_api/events/cctvReportSimproEvents";
import * as googleMapsEvents from "./global/services/google_maps_api/events/googleMapsEvents";
import * as firebaseAuthEvents from "./global/services/firebase_auth_api/events/firebaseAuthEvents";
import * as resendEmailEvents from "./global/services/resend_email_api/events/resendEmailEvents";
import * as simproFolderCreationEvents from "./business_components/simpro_folder_creation/services/simpro_api/events/simproFolderCreationEvents";
import * as vehicleLogsEvents from "./business_components/vehicle_logs/services/firebase_firestore/events/vehicleLogsEvents";

exports.globalSimproEvents = globalSimproEvents;
exports.rcdTestingSimproEvents = rcdTestingSimproEvents;
exports.cctvReportSimproEvents = cctvReportSimproEvents;
exports.googleMapsEvents = googleMapsEvents;
exports.firebaseAuthEvents = firebaseAuthEvents;
exports.resendEmailEvents = resendEmailEvents;
exports.simproFolderCreationEvents = simproFolderCreationEvents;
exports.vehicleLogsEvents = vehicleLogsEvents;
