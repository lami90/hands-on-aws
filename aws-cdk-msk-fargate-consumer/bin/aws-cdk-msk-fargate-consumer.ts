#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SecurityGroupStack } from '../lib/security-group-stack';

const prefix = 'msk-fargate-consumer';
const app = new cdk.App();

const securityGroupStack = new SecurityGroupStack(app, `${prefix}-security-group-stack`);
