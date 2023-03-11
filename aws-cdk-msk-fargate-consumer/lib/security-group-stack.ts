import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { CfnParameter } from 'aws-cdk-lib';

export class SecurityGroupStack extends cdk.Stack {

    public mskVpc: ec2.IVpc;
    public fargateSecurityGroup: ec2.SecurityGroup;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const mskVpcId = new CfnParameter(this, "mskVpcId", {
            type: "String",
            description: "VPC Id"
        }).valueAsString;

        const mskSecurityGroupId = new CfnParameter(this, "mskSecurityGroupId", {
            type: "String",
            description: "MSK Security Group Id"
        }).valueAsString;

        const mskSubnetIds = new CfnParameter(this, "mskSubnetIds", {
            type: 'List<AWS::EC2::Subnet::Id>',
            description: "Subnet Ids for MSK VPC"
        }).valueAsList;

        this.mskVpc = ec2.Vpc.fromVpcAttributes(this, 'MskVpc', {
            availabilityZones: [cdk.Aws.REGION],
            vpcId: mskVpcId,
            publicSubnetIds: mskSubnetIds,
        });

        const mskSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'MskSecurityGroup', mskSecurityGroupId);

        this.fargateSecurityGroup = new ec2.SecurityGroup(this, 'FargateSecurityGroup', {
            vpc: this.mskVpc,
            securityGroupName: 'FargateSecurityGroupForMsk',
            description: 'Fargate Security Group for MSK',
            allowAllOutbound: true
        });

        mskSecurityGroup.connections.allowFrom(this.fargateSecurityGroup, ec2.Port.tcp(9196), 'Allow from ruleSecurityGroup');
    }
}