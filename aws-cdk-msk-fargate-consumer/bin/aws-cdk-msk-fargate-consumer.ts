#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SecurityGroupStack } from '../lib/security-group-stack';
import {FargateStack} from "../lib/fargate-stack";

const prefix = 'msk-fargate-consumer';
const app = new cdk.App();

const securityGroupStack = new SecurityGroupStack(app, `${prefix}-security-group-stack`);

const fargateStack = new FargateStack(securityGroupStack.mskVpc, securityGroupStack.fargateSecurityGroup, app, `${prefix}-stack`);
fargateStack.dependencies.push(securityGroupStack);
