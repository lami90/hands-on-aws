import * as cdk from 'aws-cdk-lib';
import * as msk from 'aws-cdk-lib/aws-msk';
import { Construct } from 'constructs';
import { KafkaStack } from './kafka-stack';
import { SecretsManagerStack } from './secretsmanager-stack';

export class KafkaSecretsStack extends cdk.Stack {
    private readonly batchScramSecret: msk.CfnBatchScramSecret;

    constructor(kafkaStack: KafkaStack, secretsManagerStack: SecretsManagerStack, scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.batchScramSecret = new msk.CfnBatchScramSecret(this, 'AmazonMSK_batchScramSecret', {
            clusterArn: kafkaStack.kafkaCluster.attrArn,
            secretArnList: [secretsManagerStack.kafkaSecret.secretArn],
        });
    }
}
