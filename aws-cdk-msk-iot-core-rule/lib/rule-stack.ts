import * as cdk from 'aws-cdk-lib';
import * as iot from 'aws-cdk-lib/aws-iot';
import { Construct } from 'constructs';
import { Role } from 'aws-cdk-lib/aws-iam';
import { CfnParameter } from 'aws-cdk-lib';

export class RuleStack extends cdk.Stack {
    constructor(ruleRole: Role, destination: iot.CfnTopicRuleDestination, scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const sqlStatement = new CfnParameter(this, "sqlStatement", {
            type: "String",
            description: "SQL Statement"
        }).valueAsString;

        const bootstrapAddress = new CfnParameter(this, "bootstrapAddress", {
            type: "String",
            description: "Bootstrap address for Kafka broker. Corresponds to bootstrap.servers Kafka consumer configuration"
        }).valueAsString;

        const topic = new CfnParameter(this, "topic", {
            type: "String",
            description: "Topic name"
        }).valueAsString;

        const secretArn = new CfnParameter(this, "secretArn", {
            type: "String",
            description: "Secret ARN"
        }).valueAsString;

        const actionSendingToMsk = new iot.CfnTopicRule(this, 'KafkaTopicRule', {
            ruleName: 'kafka_topic_rule',
            topicRulePayload: {
                sql: sqlStatement,
                actions: [
                    {
                        kafka: {
                            destinationArn: destination.attrArn,
                            topic: topic,
                            clientProperties: {
                                'bootstrap.servers': `${bootstrapAddress}`,
                                'security.protocol': 'SASL_SSL',
                                'sasl.mechanism': 'SCRAM-SHA-512',
                                'sasl.scram.username': `\${get_secret('${secretArn}', 'SecretString', 'username', '${ruleRole.roleArn}')}`,
                                'sasl.scram.password': `\${get_secret('${secretArn}', 'SecretString', 'password', '${ruleRole.roleArn}')}`,
                            },
                        }
                    }
                ]
            }
        });
    }
}

