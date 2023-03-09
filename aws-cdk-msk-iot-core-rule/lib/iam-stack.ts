import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class IamStack extends cdk.Stack {

    public readonly ruleRole: iam.Role;
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create the IAM policy document
        const policy = new iam.Policy(this, 'IotRuleMskPolicy', {
            policyName: 'iot-rule-msk-policy',
            statements: [
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                        'ec2:CreateNetworkInterface',
                        'ec2:DescribeNetworkInterfaces',
                        'ec2:CreateNetworkInterfacePermission',
                        'ec2:DeleteNetworkInterface',
                        'ec2:DescribeSubnets',
                        'ec2:DescribeVpcs',
                        'ec2:DescribeVpcAttribute',
                        'ec2:DescribeSecurityGroups'
                    ],
                    resources: ['*']
                }),
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                        'secretsmanager:GetSecretValue',
                        'secretsmanager:DescribeSecret'
                    ],
                    resources: [
                        `arn:aws:secretsmanager:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:secret:kafka_client_truststore-*`,
                        `arn:aws:secretsmanager:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:secret:kafka_keytab-*`,
                        `arn:aws:secretsmanager:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:secret:AmazonMSK_*`,
                        `arn:aws:secretsmanager:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:secret:*`,
                        `arn:aws:secretsmanager:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:AmazonMSK_*`
                    ]
                }),
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ['ec2:CreateNetworkInterfacePermission'],
                    resources: ['*'],
                    conditions: {
                        StringEquals: {
                            'ec2:ResourceTag/VPCDestinationENI': 'true'
                        }
                    }
                }),
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ['ec2:CreateTags'],
                    resources: ['*'],
                    conditions: {
                        StringEquals: {
                            'ec2:CreateAction': 'CreateNetworkInterface',
                            'aws:RequestTag/VPCDestinationENI': 'true'
                        }
                    }
                })
            ]
        });

        this.ruleRole = new iam.Role(this, 'IotRuleMskRole', {
            roleName: 'iot-rule-msk-role',
            assumedBy: new iam.ServicePrincipal('iot.amazonaws.com')
        });

        this.ruleRole.attachInlinePolicy(policy);
    }
}
