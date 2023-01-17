import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EksProps } from './cluster-stack'; 

export class StrimziOperatorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EksProps) {
    super(scope, id, props);
    
    const cluster = props.cluster;

    cluster.addHelmChart("StrimziOperator", {
      chart: "strimzi-kafka-operator",
      release: "my-release",
      repository: "https://strimzi.io/charts/",
      namespace: "kafka",
    });

  }
}
