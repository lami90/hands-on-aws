import * as cdk from 'aws-cdk-lib';
import * as iot from 'aws-cdk-lib/aws-iot';
import { Construct } from 'constructs';
import { SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Role } from 'aws-cdk-lib/aws-iam';
import { CfnParameter } from 'aws-cdk-lib';

export class DestinationStack extends cdk.Stack {
    public ruleDestination: iot.CfnTopicRuleDestination;

    constructor(ruleSecurityGroup: SecurityGroup, ruleRole: Role, scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const mskVpcId = new CfnParameter(this, "mskVpcId", {
            type: "String",
            description: "VPC Id"
        }).valueAsString;

        const mskSubnetIds = new CfnParameter(this, "mskSubnetIds", {
            type: 'List<AWS::EC2::Subnet::Id>',
            description: "Subnet Ids for MSK VPC"
        }).valueAsList;

        this.ruleDestination = new iot.CfnTopicRuleDestination(this, 'RuleDestination', {
            vpcProperties: {
                subnetIds: mskSubnetIds,
                securityGroups: [ruleSecurityGroup.securityGroupId],
                roleArn: ruleRole.roleArn,
                vpcId: mskVpcId
            }
        });
    }
}

