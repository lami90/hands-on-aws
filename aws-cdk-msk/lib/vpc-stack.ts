import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class VpcStack extends cdk.Stack {
    public readonly vpc: ec2.Vpc;
    public readonly kafkaSecurityGroup: ec2.SecurityGroup;
    public readonly lambdaSecurityGroup: ec2.SecurityGroup;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.vpc = new ec2.Vpc(this, 'vpc');

        this.kafkaSecurityGroup = new ec2.SecurityGroup(this, 'kafkaSecurityGroup', {
            securityGroupName: 'kafkaSecurityGroup',
            vpc: this.vpc,
            allowAllOutbound: true
        });

        this.lambdaSecurityGroup = new ec2.SecurityGroup(this, 'lambdaSecurityGroup', {
            securityGroupName: 'lambdaSecurityGroup',
            vpc: this.vpc,
            allowAllOutbound: true
        });

        this.kafkaSecurityGroup.connections.allowFrom(this.lambdaSecurityGroup, ec2.Port.allTraffic(), 'allowFromLambdaToKafka');
    }
}