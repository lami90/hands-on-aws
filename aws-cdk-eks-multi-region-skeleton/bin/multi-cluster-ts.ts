#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ClusterStack } from '../lib/cluster-stack';
import { ContainerStack } from '../lib/container-stack';
import { CicdStack } from '../lib/cicd-stack';
import { StrimziOperatorStack } from '../lib/strimzi-operator-stack';

const app = new cdk.App();

const account = app.node.tryGetContext('account') || process.env.CDK_INTEG_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT;
const primaryRegion = {account: account, region: 'ap-northeast-2'};
const primaryOnDemandInstanceType = 't3.large';

const primaryCluster = new ClusterStack(app, `ClusterStack-${primaryRegion.region}`, {
    env: primaryRegion,
    onDemandInstanceType: primaryOnDemandInstanceType,
    primaryRegion: primaryRegion.region
});

new StrimziOperatorStack(app, `StrimziOperatorStack-${primaryRegion.region}`, {
    env: primaryRegion,
    cluster: primaryCluster.cluster
});

new ContainerStack(app, `ContainerStack-${primaryRegion.region}`, {
    env: primaryRegion,
    cluster: primaryCluster.cluster
});

new CicdStack(app, `CicdStack`, {
    env: primaryRegion,
    primaryRegion: primaryRegion.region,
    primaryRegionCluster: primaryCluster.cluster,
    primaryRegionRole: primaryCluster.regionRole,
});

app.synth();