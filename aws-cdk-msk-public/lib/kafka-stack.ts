import * as cdk from 'aws-cdk-lib';
import * as msk from 'aws-cdk-lib/aws-msk';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { VpcStack } from './vpc-stack';
import { SecretsManagerStack } from './secretsmanager-stack';
import { CfnConfiguration } from 'aws-cdk-lib/aws-msk';

export class KafkaStack extends cdk.Stack {
    public readonly kafkaCluster: msk.CfnCluster;

    constructor(vpcStack: VpcStack, secretsmanager: SecretsManagerStack, scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const config = new CfnConfiguration(this, 'public-kafka-config', {
            name: 'public-msk-config',
            serverProperties: 'auto.create.topics.enable=false\n' +
                'default.replication.factor=3\n' +
                'min.insync.replicas=2\n' +
                'num.io.threads=8\n' +
                'num.network.threads=5\n' +
                'num.partitions=1\n' +
                'num.replica.fetchers=2\n' +
                'replica.lag.time.max.ms=30000\n' +
                'socket.receive.buffer.bytes=102400\n' +
                'socket.request.max.bytes=104857600\n' +
                'socket.send.buffer.bytes=102400\n' +
                'unclean.leader.election.enable=true\n' +
                'zookeeper.session.timeout.ms=18000\n' +
                'allow.everyone.if.no.acl.found=true\n',
            kafkaVersionsList: ['3.3.1'],

        });

        this.kafkaCluster = new msk.CfnCluster(this, 'public-kafka-cluster', {
            clusterName: 'public-kafka-cluster',
            kafkaVersion: '3.3.1',
            numberOfBrokerNodes: 3,
            configurationInfo: {
                arn: config.attrArn,
                revision: 1
            },
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
                // connectivityInfo: {
                //     publicAccess: {
                //         type: 'SERVICE_PROVIDED_EIPS'
                //     }
                // }
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
