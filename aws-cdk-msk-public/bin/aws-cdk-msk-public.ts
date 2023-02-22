#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { KafkaStack } from '../lib/kafka-stack';
import { SecretsManagerStack } from '../lib/secretsmanager-stack';
import { KafkaSecretsStack } from '../lib/kafka-secrets-stack';
import { Ec2BastionStack } from '../lib/ec2-bastion';

const app = new cdk.App();

const prefix = 'public-msk';
const vpcStack = new VpcStack(app, `${prefix}-vpc-stack`);
const secretsManagerStack = new SecretsManagerStack(app, `${prefix}-secretsmanager-stack`);

const kafkaStack = new KafkaStack(vpcStack, secretsManagerStack, app, `${prefix}-kafka-stack`);
kafkaStack.dependencies.push(vpcStack);
kafkaStack.dependencies.push(secretsManagerStack);

const kafkaSecretsStack = new KafkaSecretsStack(kafkaStack, secretsManagerStack, app, `${prefix}-kafka-secrets-mapping-stack`);
kafkaSecretsStack.dependencies.push(kafkaStack);

kafkaSecretsStack.dependencies.push(secretsManagerStack);

const ec2BastionStack = new Ec2BastionStack(vpcStack, app, `${prefix}-ec2-bastion-stack`);
ec2BastionStack.dependencies.push(vpcStack);
