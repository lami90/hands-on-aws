import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';
import { VpcStack } from "./vpc-stack";

export class Ec2BastionStack extends cdk.Stack {
    constructor(vpcStack: VpcStack, scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create a Key Pair to be used with this EC2 Instance
        const cfnKeyPair = new ec2.CfnKeyPair(this, 'CfnKeyPair', {
            keyName: 'test-key-pair',
        })
        cfnKeyPair.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)

        const role = new iam.Role(this, 'ec2Role', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
        })

        role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'))

        // Use Amazon Linux Image - CPU Type X86
        const ami = new ec2.AmazonLinuxImage({
            generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
            cpuType: ec2.AmazonLinuxCpuType.X86_64
        });

        // Create the instance using the Security Group, AMI, and KeyPair defined in the VPC created
        const ec2Instance = new ec2.Instance(this, 'Instance', {
            vpc: vpcStack.vpc,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.SMALL),
            machineImage: ami,
            securityGroup: vpcStack.ec2BastionSecurityGroup,
            keyName: cdk.Token.asString(cfnKeyPair.ref),
            role: role,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC
            }
        });
        ec2Instance.connections.allowFromAnyIpv4(ec2.Port.tcp(22))

        // Create an asset that will be used as part of User Data to run on first load
        const asset = new Asset(this, 'Asset', { path: path.join(__dirname, '../src/config.sh') });
        const localPath = ec2Instance.userData.addS3DownloadCommand({
            bucket: asset.bucket,
            bucketKey: asset.s3ObjectKey,
        });

        ec2Instance.userData.addExecuteFileCommand({
            filePath: localPath,
            arguments: '--verbose -y'
        });
        asset.grantRead(ec2Instance.role);

        // Create outputs for connecting
        new cdk.CfnOutput(this, 'IP Address', { value: ec2Instance.instancePublicIp });
        new cdk.CfnOutput(this, 'GetSSHKeyCommand', { value: `chmod 777 cdk-key.pem && aws ssm get-parameter --name /ec2/keypair/${cfnKeyPair.getAtt('KeyPairId')} --region ${this.region} --with-decryption --query Parameter.Value --output text > cdk-key.pem && chmod 400 cdk-key.pem` });
        new cdk.CfnOutput(this, 'ssh command', { value: 'ssh -i cdk-key.pem -o IdentitiesOnly=yes ec2-user@' + ec2Instance.instancePublicIp });
    }
}