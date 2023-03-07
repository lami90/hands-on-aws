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

        this.kafkaCluster = new msk.CfnCluster(this, 'public-kafka-cluster', {
            clusterName: 'public-kafka-cluster',
            kafkaVersion: '3.3.1',
            numberOfBrokerNodes: 3,
            brokerNodeGroupInfo: {
                securityGroups: [vpcStack.kafkaSecurityGroup.securityGroupId],
                clientSubnets: [...vpcStack.vpc.selectSubnets({
                    subnetType: ec2.SubnetType.PUBLIC
                }).subnetIds],
                instanceType: 'kafka.t3.small',
                storageInfo: {
                    ebsStorageInfo: {
                        volumeSize: 100
                    }
                },
            },
            clientAuthentication: {
                sasl: {
                    scram: {
                        enabled: true
                    }
                },
                unauthenticated: {
                    enabled: false
                }
            },
            encryptionInfo: {
                encryptionAtRest: {
                    dataVolumeKmsKeyId: secretsmanager.key.keyId
                }
            },
            enhancedMonitoring: 'PER_TOPIC_PER_PARTITION',
            openMonitoring: {
                prometheus: {
                    jmxExporter: {
                        enabledInBroker: true
                    },
                    nodeExporter: {
                        enabledInBroker: true
                    }
                }
            },
        });
    }
}
