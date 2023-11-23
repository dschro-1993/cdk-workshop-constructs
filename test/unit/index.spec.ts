import * as assertions from "aws-cdk-lib/assertions";

import { ServerlessApp } from "../../lib/index";

import * as cdk from "aws-cdk-lib";

describe("ServerlessApp", () => {
  // let fromAssetMock: jest.SpyInstance;

  // beforeEach(() => {
  //   fromAssetMock = jest.spyOn({}, "fromAsset").mockReturnValue({
  //     bind: (): CodeConfig => {
  //       return {
  //         s3Location: {
  //           bucketName: "my-bucket",
  //           objectName: "my-object",
  //         },
  //       };
  //     },
  //     bindToResource: () => {
  //       return;
  //     },
  //   });
  // });

  let assert = assertions.Template.fromStack(
    new ServerlessApp(new cdk.App(), "ServerlessApp", {
      apiHandler: "",
      apiPath:    "",
      appPath:    "",
    }),
  );

  test("App-Bucket has correct Props", () => {
    assert.hasResourceProperties(
      "AWS::S3::Bucket",
      { // Uses => "assertions.Match.objectLike({...})"
        // ...
        // PublicAccessBlockConfiguration: {
        //   BlockPublicPolicies: true,
        //   BlockPublicAcls:     true,
        // },
        VersioningConfiguration: {
          Status: "Enabled",
        },
        // ...
      }
    );
  });
});
