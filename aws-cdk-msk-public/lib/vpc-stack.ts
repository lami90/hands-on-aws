import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { SubnetType } from "aws-cdk-lib/aws-ec2";

export class VpcStack extends cdk.Stack {
    public readonly vpc: ec2.Vpc;
    public readonly kafkaSecurityGroup: ec2.SecurityGroup;
    public readonly ec2BastionSecurityGroup: ec2.SecurityGroup;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.vpc = new ec2.Vpc(this, 'public-msk-vpc', {
            ipAddresses: ec2.IpAddresses.cidr('10.10.0.0/16'),
            enableDnsHostnames: true,
            enableDnsSupport: true,
            subnetConfiguration: [
                {
                    name: 'PublicSubnet',
                    subnetType: SubnetType.PUBLIC,
                    cidrMask: 24,
                }
            ],
            availabilityZones: ['ap-northeast-2a', 'ap-northeast-2b', 'ap-northeast-2c'],
        });

        if (this.vpc.privateSubnets.length > 0) {
            throw new Error('Private subnets are not allowed in public VPC');
        }

        this.kafkaSecurityGroup = new ec2.SecurityGroup(this, 'public-msk-security-group', {
            securityGroupName: 'public-msk-security-group',
            vpc: this.vpc,
            allowAllOutbound: true,
        });
        this.kafkaSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(9096), 'Allow Kafka from anywhere');
        this.kafkaSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(9196), 'Allow Kafka from anywhere');
        this.kafkaSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(2181), 'Allow Zookeeper from anywhere');

        this.ec2BastionSecurityGroup = new ec2.SecurityGroup(this, 'ec2BastionSecurityGroup', {
            securityGroupName: 'ec2BastionSecurityGroup',
            vpc: this.vpc,
            allowAllOutbound: true
        });
        this.ec2BastionSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH from anywhere');

        this.kafkaSecurityGroup.connections.allowFrom(this.ec2BastionSecurityGroup, ec2.Port.allTraffic(), 'allowFromEc2BastionToKafka');
    }
}