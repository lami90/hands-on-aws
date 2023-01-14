import * as cdk from 'aws-cdk-lib';
import codecommit = require('aws-cdk-lib/aws-codecommit');
import ecr = require('aws-cdk-lib/aws-ecr');
import codepipeline = require('aws-cdk-lib/aws-codepipeline');
import pipelineAction = require('aws-cdk-lib/aws-codepipeline-actions');
import { codeToECRspec, deployToEKSspec } from '../utils/buildspecs';
import { Construct } from 'constructs';

export class CicdStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        const primaryRegion = 'ap-northeast-2';
        const secondaryRegion = 'us-west-2';

    }
}


