import * as globalSimpro from "./global/services/simpro_api/functions/globalSimpro";
import * as rcdTestingSimpro from "./business_components/rcd_testing/services/simpro_api/functions/rcdTestingSimpro";
import * as cctvReportSimpro from "./business_components/cctv_report/services/simpro_api/functions/cctvReportSimpro";
import * as googleMaps from "./global/services/google_maps_api/functions/googleMaps";
import * as firebaseAuth from "./global/services/firebase_auth_api/functions/firebaseAuth";
import * as resendEmail from "./global/services/resend_email_api/functions/resendEmail";
import * as simproFolderCreation from "./business_components/simpro_folder_creation/simpro_api/functions/simproFolderCreation";

exports.globalSimpro = globalSimpro;
exports.rcdTestingSimpro = rcdTestingSimpro;
exports.cctvReportSimpro = cctvReportSimpro;
exports.googleMaps = googleMaps;
exports.firebaseAuth = firebaseAuth;
exports.resendEmail = resendEmail;
exports.simproFolderCreation = simproFolderCreation;
