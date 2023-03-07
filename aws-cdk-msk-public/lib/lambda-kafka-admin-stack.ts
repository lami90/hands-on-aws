import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { VpcStack } from './vpc-stack';
import { KafkaStack } from './kafka-stack';
import { CfnParameter, Duration } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class LambdaKafkaAdminStack extends cdk.Stack {

    constructor(vpcStack: VpcStack, kafkaStack: KafkaStack, scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const bootstrapAddress = new CfnParameter(this, "bootstrapAddress", {
            type: "String",
            description: "Bootstrap address for Kafka broker. Corresponds to bootstrap.servers Kafka consumer configuration"
        }).valueAsString;

        let username = new CfnParameter(this, "username", {
            type: "String",
            description: "username for Kafka"
        }).valueAsString;

        let password = new CfnParameter(this, "password", {
            type: "String",
            description: "Kafka topic name"
        }).valueAsString;

        // Lambda function to support cloudformation custom resource to create kafka topics.
        const kafkaAdminHandler = new NodejsFunction(this, "KafkaAdminHandler", {
            runtime: Runtime.NODEJS_14_X,
            entry: 'lambda/kafka-admin-handler.ts',
            handler: 'handler',
            vpc: vpcStack.vpc,
            securityGroups: [vpcStack.lambdaSecurityGroup],
            functionName: 'kafka-admin-handler',
            timeout: Duration.minutes(5),
            environment: {
                'BOOTSTRAP_ADDRESS': bootstrapAddress,
                'USERNAME': username,
                'PASSWORD': password
            },
            allowPublicSubnet: true
        });

        kafkaAdminHandler.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['kafka:*'],
            resources: [kafkaStack.kafkaCluster.ref]
        }));
    }
}
