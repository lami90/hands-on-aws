import * as cdk from 'aws-cdk-lib';
import { readYamlFromDir } from '../utils/read-file';
import { EksProps } from './cluster-stack';
import { Construct } from 'constructs';

export class ContainerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EksProps) {
    super(scope, id, props);

    const cluster = props.cluster;
    const kafkaNamespaceFolder = './yaml-common/kafka/';
    const kafkaStrimziFolder = `./yaml-${cdk.Stack.of(this).region}/strimzi/`;
    const kafkaClusterFolder = `./yaml-${cdk.Stack.of(this).region}/kafka/`;

    readYamlFromDir(kafkaNamespaceFolder, cluster);
    readYamlFromDir(kafkaStrimziFolder, cluster);
    readYamlFromDir(kafkaClusterFolder, cluster);

  }
}