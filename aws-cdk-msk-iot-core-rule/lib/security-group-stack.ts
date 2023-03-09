import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { CfnParameter } from 'aws-cdk-lib';

export class SecurityGroupStack extends cdk.Stack {

    public mskVpc: ec2.IVpc;
    public ruleSecurityGroup: ec2.SecurityGroup;

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

        this.mskVpc = ec2.Vpc.fromVpcAttributes(this, 'MskVpcId', {
            availabilityZones: [cdk.Aws.REGION],
            vpcId: mskVpcId
        });

        const mskSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'MskSecurityGroup', mskSecurityGroupId);

        this.ruleSecurityGroup = new ec2.SecurityGroup(this, 'MySecurityGroupId', {
            vpc: this.mskVpc,
            securityGroupName: 'MySecurityGroupName',
            description: 'My Security Group Description',
            allowAllOutbound: true
        });

        mskSecurityGroup.connections.allowFrom(this.ruleSecurityGroup, ec2.Port.tcp(9196), 'Allow from ruleSecurityGroup');
    }
}