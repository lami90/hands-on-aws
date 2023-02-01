#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { KafkaStack } from '../lib/kafka-stack';
import { Ec2BastionStack } from '../lib/ec2-bastion';
import { SecretsManagerStack } from '../lib/secretsmanager-stack';
import { KafkaSecretsStack } from '../lib/kafka-secrets-stack';

const app = new cdk.App();

const vpcStack = new VpcStack(app, 'VpcStack');
const secretsManagerStack = new SecretsManagerStack(app, 'SecretsManagerStack');

const ec2BastionStack = new Ec2BastionStack(vpcStack, app, 'Ec2BastionStack');
ec2BastionStack.dependencies.push(vpcStack);

const kafkaStack = new KafkaStack(vpcStack, secretsManagerStack, app, 'KafkaStack');
kafkaStack.dependencies.push(vpcStack);
kafkaStack.dependencies.push(secretsManagerStack);

const kafkaSecretsStack = new KafkaSecretsStack(kafkaStack, secretsManagerStack, app, 'KafkaSecretsStack');
kafkaSecretsStack.dependencies.push(kafkaStack);
kafkaSecretsStack.dependencies.push(secretsManagerStack);
