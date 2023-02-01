import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class SecretsManagerStack extends cdk.Stack {

    public readonly key: kms.Key;
    public readonly kafkaSecret: secretsmanager.Secret;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.key = new kms.Key(this, 'my-kms-key', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            pendingWindow: cdk.Duration.days(7),
            alias: 'kafka/poc',
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
            encryptionKey: this.key,
        });

        new iam.User(this, 'KafkaUser', {
            userName: this.kafkaSecret.secretValueFromJson('username').unsafeUnwrap(),
            password: this.kafkaSecret.secretValueFromJson('password'),
        });
    }
}
