import * as cdk from 'aws-cdk-lib';
import { readYamlFromDir } from '../utils/read-file';
import { EksProps } from './cluster-stack';
import { Construct } from 'constructs';

export class ContainerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EksProps) {
    super(scope, id, props);
  }
}