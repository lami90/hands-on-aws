#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { IamStack } from '../lib/iam-stack';
import { DestinationStack } from '../lib/destination-stack';
import { SecurityGroupStack } from '../lib/security-group-stack';

const prefix = 'msk-iot-core-rule';
const app = new cdk.App();

const iamStack = new IamStack(app, `${prefix}-iam-stack`);

const securityGroupStack = new SecurityGroupStack(app, `${prefix}-security-group-stack`);

const destinationStack = new DestinationStack(securityGroupStack.ruleSecurityGroup, iamStack.ruleRole, app, `${prefix}-destination-stack`);
destinationStack.dependencies.push(iamStack);
destinationStack.dependencies.push(securityGroupStack);
