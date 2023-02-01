import * as cdk from 'aws-cdk-lib';
import * as msk from 'aws-cdk-lib/aws-msk';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { VpcStack } from './vpc-stack';
import { SecretsManagerStack } from './secretsmanager-stack';

export class KafkaStack extends cdk.Stack {
    public readonly kafkaCluster: msk.CfnCluster;

    constructor(vpcStack: VpcStack, secretsmanager: SecretsManagerStack, scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        this.kafkaCluster = new msk.CfnCluster(this, 'kafkaCluster', {
            brokerNodeGroupInfo: {
                securityGroups: [vpcStack.kafkaSecurityGroup.securityGroupId],
                clientSubnets: [...vpcStack.vpc.selectSubnets({
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
                }).subnetIds],
                instanceType: 'kafka.t3.small',
                storageInfo: {
                    ebsStorageInfo: {
                        volumeSize: 5
                    }
                }
            },
            clusterName: 'KafkaCluster',
            kafkaVersion: '3.3.1',
            numberOfBrokerNodes: 2,
            clientAuthentication: {
                sasl: {
                    scram: {
                        enabled: true
                    }
                },
                unauthenticated: {
                    enabled: false
                }
            }
            // add this to test the error
            // encryptionInfo: {
            //     encryptionAtRest: {
            //         dataVolumeKmsKeyId: secretsmanager.key.keyId
            //     }
            // }
        });
    }
}
