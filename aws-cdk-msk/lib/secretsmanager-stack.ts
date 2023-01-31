import * as cdk from 'aws-cdk-lib';
import * as msk from 'aws-cdk-lib/aws-msk';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { VpcStack } from './vpc-stack';

export class SecretsManagerStack extends cdk.Stack {
    public readonly ksm: secretsmanager.Secret;
    public readonly kafkaSecret: secretsmanager.Secret;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const key = new kms.Key(this, 'my-kms-key', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            pendingWindow: cdk.Duration.days(7),
            alias: 'kafka/mykey',
            description: 'KMS key for Kafka',
            enableKeyRotation: false,
        });

        this.kafkaSecret = new secretsmanager.Secret(this, 'AmazonMSK_kafkaSecret', {
            secretName: 'AmazonMSK_kafkaSecret',
            secretStringValue: cdk.SecretValue.unsafePlainText(
                JSON.stringify({
                        username: 'kafka',
                        password: 'kafka-secret'
                    }
                )
            ),
            encryptionKey: key,
        });

        new iam.User(this, 'KafkaUser', {
            userName: this.kafkaSecret.secretValueFromJson('username').unsafeUnwrap(),
            password: this.kafkaSecret.secretValueFromJson('password'),
        });
    }
}
