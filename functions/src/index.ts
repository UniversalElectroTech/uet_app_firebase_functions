import { firebaseFunctionsConfig } from "./global/firebaseFunctions/appConfig";
firebaseFunctionsConfig;

import * as test from "./global/test/testFunction";
// import * as global from "./global/services/simpro_api/functions/global";
// import * as rcdTesting from "./business_components/rcd_testing/functions/rcdTesting";

exports.tests = test;
// exports.global = global;
// exports.rcdTesting = rcdTesting;
