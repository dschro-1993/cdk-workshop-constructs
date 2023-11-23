import * as cdk from "aws-cdk-lib";

import { ServerlessApp } from "../lib/index";

const app = new cdk.App();

new ServerlessApp(app, "ServerlessAppXY", {
  execDeploymentTests: !false,

  apiHandler: "main.foobaz",
  appPath:    "bin/app",
  apiPath:    "bin/api",
});
