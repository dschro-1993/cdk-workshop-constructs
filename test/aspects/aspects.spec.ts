import * as assertions from "aws-cdk-lib/assertions";

import { CustomAspects } from "@dschro-1993/cdk-workshop-aspects";

import {
  ServerlessAppProps,
  ServerlessApp
} from "../../lib/index";

import * as cdk from "aws-cdk-lib";
import * as nag from "cdk-nag";

const props: ServerlessAppProps = {
  apiHandler: "",
  apiPath:    "",
  appPath:    "",
};

describe("cdknag", () => {
  let myApp: ServerlessApp;

  beforeAll(() => {
    myApp = new ServerlessApp(new cdk.App(), "App", props);
    // cdknag Rules ===> https://github.com/cdklabs/cdk-nag/blob/main/RULES.md
    cdk.Aspects.of(myApp).add(new nag.NIST80053R4Checks());
    cdk.Aspects.of(myApp).add(new nag.NIST80053R5Checks());
    // ...
  });

  test("NIST_R4", () => {
    let found = assertions.Annotations
      .fromStack(myApp)
      .findError("*", assertions.Match.stringLikeRegexp("NIST.800.53.R4-.*"));

    expect(found).toHaveLength(0);
  });

  test("NIST_R5", () => {
    let found = assertions.Annotations
      .fromStack(myApp)
      .findError("*", assertions.Match.stringLikeRegexp("NIST.800.53.R5-.*"));

    expect(found).toHaveLength(0);
  });

  // ...
});

describe("custom", () => {
  let myApp: ServerlessApp;

  beforeAll(() => {
    myApp = new ServerlessApp(new cdk.App(), "App", props);
    // Custom Rules
    cdk.Aspects.of(myApp).add(new CustomAspects());
    // ...
  });

  test("Custom", () => {
    let found = assertions.Annotations
      .fromStack(myApp)
      .findError("*", assertions.Match.stringLikeRegexp("Custom-.*"));

    expect(found).toHaveLength(0);
  });

  // ...
});
