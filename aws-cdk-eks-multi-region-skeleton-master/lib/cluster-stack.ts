import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { PhysicalName } from 'aws-cdk-lib';

export class ClusterStack extends cdk.Stack {
  public readonly cluster: eks.Cluster;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const primaryRegion = 'ap-northeast-2';

    const clusterAdmin = new iam.Role(this, 'AdminRole', {
      assumedBy: new iam.AccountRootPrincipal()
    });

    const cluster = new eks.Cluster(this, 'hsseo-test-eks-cluster', {
      clusterName: `hsseo-test-eks-cluster`,
      mastersRole: clusterAdmin,
      version: eks.KubernetesVersion.V1_24,
      defaultCapacity: 1
    });

    cluster.addAutoScalingGroupCapacity('spot-group', {
      instanceType: new ec2.InstanceType('m5.xlarge'),
      spotPrice: cdk.Stack.of(this).region==primaryRegion ? '0.248' : '0.192'
    });

    this.cluster = cluster;
  }
}

function createDeployRole(scope: Construct, id: string, cluster: eks.Cluster): iam.Role {
  const role = new iam.Role(scope, id, {
    roleName: PhysicalName.GENERATE_IF_NEEDED,
    assumedBy: new iam.AccountRootPrincipal()
  });
  cluster.awsAuth.addMastersRole(role);

  return role;
}

export interface EksProps extends cdk.StackProps {
  cluster: eks.Cluster
}