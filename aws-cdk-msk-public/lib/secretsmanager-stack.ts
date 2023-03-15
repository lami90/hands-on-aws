import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { CfnParameter } from 'aws-cdk-lib';

export class SecretsManagerStack extends cdk.Stack {

    public readonly key: kms.Key;
    public readonly kafkaSecret: secretsmanager.Secret;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        let username = new CfnParameter(this, "username", {
            type: "String",
            description: "username for Kafka"
        });

        let password = new CfnParameter(this, "password", {
            type: "String",
            description: "password for Kafka"
        });

        this.key = new kms.Key(this, 'public-msk-kms-key', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            pendingWindow: cdk.Duration.days(7),
            alias: 'kafka/public-msk',
            description: 'KMS key for Kafka',
            enableKeyRotation: false,
        });

        this.kafkaSecret = new secretsmanager.Secret(this, 'AmazonMSK_PublicKafkaSecret', {
            secretName: 'AmazonMSK_PublicKafkaSecret',
            secretStringValue: cdk.SecretValue.unsafePlainText(
                JSON.stringify({
                        username: username.valueAsString,
                        password: password.valueAsString
                    }
                )
            ),
            encryptionKey: this.key,
        });

        new iam.User(this, 'PublicKafkaUser', {
            userName: this.kafkaSecret.secretValueFromJson('username').unsafeUnwrap(),
            password: this.kafkaSecret.secretValueFromJson('password'),
        });
    }
}
