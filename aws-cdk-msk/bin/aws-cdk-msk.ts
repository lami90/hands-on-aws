#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { KafkaStack } from '../lib/kafka-stack';
import { Ec2BastionStack } from '../lib/ec2-bastion';
import { SecretsManagerStack } from '../lib/secretsmanager-stack';
import { KafkaSecretsStack } from '../lib/kafka-secrets-stack';
import { KafkaStorageAutoScalingStack } from '../lib/kafka-storage-autoscaling-stack';
import { KafkaMonitoringStack } from '../lib/kafka-monitoring-stack';
import { FargateStack } from '../lib/fargate-stack';

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

const kafkaStorageAutoScalingStack = new KafkaStorageAutoScalingStack(kafkaStack, app, 'KafkaStorageAutoScalingStack');
kafkaStorageAutoScalingStack.dependencies.push(kafkaStack);

const kafkaMonitoringStack = new KafkaMonitoringStack(vpcStack, app, 'KafkaMonitoringStack');
kafkaMonitoringStack.dependencies.push(vpcStack);

const fargateStack = new FargateStack(vpcStack, app, 'FargateStack');
fargateStack.dependencies.push(vpcStack);
fargateStack.dependencies.push(secretsManagerStack);
fargateStack.dependencies.push(kafkaStack);
