import { IConstruct } from "constructs";

import * as cdk from "aws-cdk-lib";

export interface TaggableProps extends cdk.StackProps {
  // ...
}

export class Taggable extends cdk.Stack {
  constructor(scope: IConstruct, id: string, props: TaggableProps) {
    super(scope, id, props);

    // Construct-Specific Tagging

    // cdk.Tags.of(this).add("construct-X", "{...}");
    // cdk.Tags.of(this).add("construct-Y", "{...}");

    // {...}
  }
}
