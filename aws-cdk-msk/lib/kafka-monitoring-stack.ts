import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';
import { VpcStack } from './vpc-stack';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import * as path from 'path';
import * as ecrdeploy from 'cdk-ecr-deployment';
import * as alb from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface ImageMetadata {
    name: string;
    containerPort: number;
    hostPort: number;
}

interface EcrMetadata {
    imageMetadata: ImageMetadata;
    asset: DockerImageAsset;
    repository: ecr.Repository;
}

export class KafkaMonitoringStack extends cdk.Stack {

    private readonly imageMetadata: ImageMetadata[] = [
        { name: "example1", containerPort: 80, hostPort: 80 },
        { name: "example2", containerPort: 80, hostPort: 80 },
    ];

    constructor(vpcStack: VpcStack, scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Build docker image
        let ecrMetadata: EcrMetadata[] = [];
        for (const imageMetadata of this.imageMetadata) {
            // Build docker image
            const asset = new DockerImageAsset(this, `${imageMetadata.name}Asset`, {
                directory: path.join("image", imageMetadata.name)
            });

            // Create ECR repository
            const repositoryName = `msk-monitoring-${imageMetadata.name.toLowerCase()}`
            const repository = new ecr.Repository(this, `${imageMetadata.name}Repository`, {
                repositoryName: `${repositoryName}`
            });

            // Deploy docker image to ECR
            new ecrdeploy.ECRDeployment(this, `Deploy${imageMetadata.name}Image`, {
                src: new ecrdeploy.DockerImageName(asset.imageUri),
                dest: new ecrdeploy.DockerImageName(`${cdk.Aws.ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com/${repositoryName}:latest`),
            });

            ecrMetadata.push({ imageMetadata: imageMetadata, asset: asset, repository: repository});
        }

        // Create ECS cluster
        const cluster = new ecs.Cluster(this, 'MskMonitoringCluster', {
            vpc: vpcStack.vpc,
            clusterName: 'msk-monitoring'
        });

        for (const metadata of ecrMetadata) {
            // Create ECS task definition
            const taskDefinition = new ecs.FargateTaskDefinition(this, `${metadata.imageMetadata.name}TaskDefinition`, {
                memoryLimitMiB: 512,
                cpu: 256,
                runtimePlatform: {
                    operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
                    cpuArchitecture: ecs.CpuArchitecture.ARM64,
                },
            });

            // Create ECS container definition
            const containerDefinition = taskDefinition.addContainer(`${metadata.imageMetadata.name}Container`, {
                image: ecs.ContainerImage.fromEcrRepository(metadata.repository),
                memoryLimitMiB: 512,
                cpu: 256,
                logging: ecs.LogDrivers.awsLogs({
                    streamPrefix: `msk-${metadata.imageMetadata.name}-ecs`,
                }),
                portMappings: [
                    {
                        containerPort: metadata.imageMetadata.containerPort,
                        hostPort: metadata.imageMetadata.hostPort
                    },
                ],
            });

            // Create ECS service
            const service = new ecs.FargateService(this, `${metadata.imageMetadata.name}Service`, {
                cluster: cluster,
                taskDefinition: taskDefinition,
                desiredCount: 1,
                serviceName: `msk-${metadata.imageMetadata.name}-service`,
                assignPublicIp: true,
            });

            // Create ECS load balancer
            const loadBalancer = new alb.ApplicationLoadBalancer(this, `${metadata.imageMetadata.name}LoadBalancer`, {
                vpc: cluster.vpc,
                internetFacing: true,
                loadBalancerName: `${metadata.imageMetadata.name}-alb`,
            });

            // Create ECS listener
            const listener = loadBalancer.addListener(`${metadata.imageMetadata.name}Listener`, {
                port: metadata.imageMetadata.hostPort,
            });

            // Create ECS target group
            const targetGroup = listener.addTargets(`${metadata.imageMetadata.name}TargetGroup`, {
                port: metadata.imageMetadata.hostPort,
                targets: [service],
                healthCheck: {
                    path: '/',
                    interval: cdk.Duration.seconds(60),
                    timeout: cdk.Duration.seconds(5),
                    healthyHttpCodes: '200',
                },
            });

            // Create ECS security group
            const securityGroup = new ec2.SecurityGroup(this, `${metadata.imageMetadata.name}SecurityGroup`, {
                vpc: cluster.vpc,
                allowAllOutbound: true,
            });

            // Create ECS security group ingress rule
            securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(metadata.imageMetadata.hostPort), 'Allow HTTP access from the Internet');

            // Create ECS security group egress rule
            securityGroup.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(metadata.imageMetadata.hostPort), 'Allow HTTP access to the Internet');
        }
    }
}