import { firebaseFunctionsService } from "./global/firebaseFunctions/services/firebaseFunctions";
firebaseFunctionsService;

import * as test from "./global/test/testFunction";
import * as globalSimpro from "./global/services/simpro_api/functions/globalSimpro";
import * as rcdTestingSimpro from "./business_components/rcd_testing/services/simpro_api/functions/rcdTestingSimpro";
import * as cctvReportSimpro from "./business_components/cctv_report/services/simpro_api/functions/cctvReportSimpro";
import * as googleMaps from "./global/services/google_maps_api/functions/googleMaps";

exports.tests = test;
exports.globalSimpro = globalSimpro;
exports.rcdTestingSimpro = rcdTestingSimpro;
exports.cctvReportSimpro = cctvReportSimpro;
exports.googleMaps = googleMaps;
