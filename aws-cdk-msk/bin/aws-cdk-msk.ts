#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { KafkaStack } from '../lib/kafka-stack';

const app = new cdk.App();

const vpcStack = new VpcStack(app, 'VpcStack');
const kafkaStack = new KafkaStack(vpcStack, app, 'KafkaStack');
kafkaStack.dependencies.push(vpcStack);
