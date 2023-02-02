import * as cdk from 'aws-cdk-lib';
import * as autoscaling from 'aws-cdk-lib/aws-applicationautoscaling';
import { KafkaStack } from './kafka-stack';
import { Construct } from 'constructs';

export class KafkaStorageAutoScalingStack extends cdk.Stack {
    public readonly scalingTarget: autoscaling.ScalableTarget;
    public readonly scalingPolicy: autoscaling.CfnScalingPolicy;

    constructor(kafkaStack: KafkaStack, scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.scalingTarget = new autoscaling.ScalableTarget(this, 'kafkaScalingTarget', {
            serviceNamespace: autoscaling.ServiceNamespace.KAFKA,
            maxCapacity: 100,
            minCapacity: 1,
            resourceId: kafkaStack.kafkaCluster.attrArn,
            scalableDimension: 'kafka:broker-storage:VolumeSize',
        });

        this.scalingPolicy = new autoscaling.CfnScalingPolicy(this, 'kafkaScalingPolicy', {
            policyName: 'kafkaStorageScalingPolicy',
            policyType: 'TargetTrackingScaling',
            scalingTargetId: this.scalingTarget.scalableTargetId,
            targetTrackingScalingPolicyConfiguration: {
                targetValue: 60,
                predefinedMetricSpecification: {
                    predefinedMetricType: 'KafkaBrokerStorageUtilization'
                }
            }
        });
    }
}
