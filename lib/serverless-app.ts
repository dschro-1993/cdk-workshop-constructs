import { IConstruct } from "constructs";

import { Taggable, TaggableProps } from "./taggable";

import * as origins    from "aws-cdk-lib/aws-cloudfront-origins";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

import * as lambda from "aws-cdk-lib/aws-lambda";

import * as s3_deployment from "aws-cdk-lib/aws-s3-deployment";
import * as s3            from "aws-cdk-lib/aws-s3";

import { Provider } from "aws-cdk-lib/custom-resources";

import * as cdk from "aws-cdk-lib";

export interface ServerlessAppProps extends cdk.StackProps {
  execDeploymentTests?: boolean;

  apiHandler: string;
  apiPath:    string;
  appPath:    string;
}

const taggableProps: TaggableProps = {};

export class ServerlessApp extends Taggable {
  constructor(scope: IConstruct, id: string, props: ServerlessAppProps) {
    super(scope, id, {...props, ...taggableProps});

    // λ + API-Gateway: {proxy+} / ANY

    const api_handler = new lambda.Function(this, "ApiHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: props.apiHandler,
      code:    lambda.Code.fromAsset(
        props.apiPath
      ),
    });

    const api = new apigateway.LambdaRestApi(this, "Api", {
      handler: api_handler,
      defaultCorsPreflightOptions: { // => CORS should be passed via Stack-Props!
        allowOrigins: ["*"],
        allowMethods: ["*"],
        allowHeaders: ["*"],
      },
    });

    // S3 + CDN

    const app = new s3.Bucket(this, "App", {});

    new s3_deployment.BucketDeployment(this, "Deployment", {
      destinationBucket: app,
      sources:           [s3_deployment.Source.asset(props.appPath)],
    });

    const oai = new cloudfront.OriginAccessIdentity(this, "OAI", {});
    app.grantRead(oai);

    const dist = new cloudfront.Distribution(this, "Distribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new origins.S3Origin(
          app,
          // Tip => Here we could also use new OAC-Pattern instead of an old OAI!
          {originAccessIdentity: oai},
          // ...
        ),
        // ...
      },
      // ..
    });

    if (props.execDeploymentTests) {
      const test = new lambda.Function(this, "DeploymentTests", {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "index.handler",
        code:    lambda.Code.fromInline(`
          exports.handler = async (event) => {
            console.log("Event: ", event);
          };
        `),
      });
  
      const provider = new Provider(this, "Provider", {
        onEventHandler: test,
      });
  
      const custom = new cdk.CustomResource(
        this,
        "CustomResource",
        {serviceToken: provider.serviceToken, properties: {now: Date.now(), url: api.url}}
      );
  
      custom.node
        .addDependency(dist);
    }
  }
}
