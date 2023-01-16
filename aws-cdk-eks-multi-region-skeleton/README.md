# Manage your EKS Cluster with CDK
This repository holds the skeleton code where you would start the journey to *[Manage your EKS Cluster with CDK](http://demogo-multiregion-eks.s3-website.ap-northeast-2.amazonaws.com/ko/)* Hands-on Lab.

Please clone this repository and start [the workshop](http://demogo-multiregion-eks.s3-website.ap-northeast-2.amazonaws.com/ko/) to play with the lab. :)


## Related Repository
* [Skeleton Repository](https://github.com/yjw113080/aws-cdk-eks-multi-region-skeleton): You would clone this repository and build up the code as going through the steps in the lab.
* [Full-code Repository](https://github.com/yjw113080/aws-cdk-eks-multi-region): Once you complete the workshop, the code would look like this repository! You can also use this repository as a sample code to actually build CDK project for your own infrastructure and containers.
* [CI/CD for CDK](https://github.com/yjw113080/aws-cdk-multi-region-cicd): Fabulous CDK team is working on providing CI/CD natively, in the meantime, you can check out simple way to do it with AWS CodePipeline and CodeBuild.
* [Sample App for Multi-region Application Deployment](https://github.com/yjw113080/aws-cdk-multi-region-sample-app): In third lab of [this workshop](http://demogo-multiregion-eks.s3-website.ap-northeast-2.amazonaws.com/ko/), you will deploy your application in your developer's shoes. This repository holds the sample app to deploy. The sample simply says 'Hello World' with the information where it is hosted.

## Problems?

After creating the cluster, you may see the following error message:

> Your current user or role does not have access to Kubernetes objects on this EKS cluster

This is because the account does not have the permission to access the cluster. You can fix this by running the following command:

```bash
kubectl edit configmap -n kube-system aws-auth

# Add the following line to the mapUsers section

mapUsers: '[{"userarn":"arn:aws:iam::${ACCOUNT_ID}:role/${USER_NAME}","username":"${USER_NAME}","groups":["system:masters"]}]'

# ${ACCOUNT_ID} is your AWS account ID
# ${USER_NAME} is your IAM user name

# Save the file and exit
```
