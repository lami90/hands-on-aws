# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## Step to deploy the stack

1. Deploy the `vpc` stack

    * dependency: none

    ```bash
    cdk deploy public-msk-vpc-stack
    ```

2. Deploy the `secretsmanager` stack

    * dependency: none

    ```bash
    cdk deploy public-msk-secretsmanager-stack \
        --parameters public-msk-secretsmanager-stack:username="${USERNAME: e.g., Kafka}" \
        --parameters public-msk-secretsmanager-stack:password="${PASSWORD: e.g., Kafka-secret}
    ```
   
3. Deploy the kafka stack

    * dependency: `vpc` stack

    ```bash
    cdk deploy public-msk-kafka-stack
    ```

4. Deploy the `kafka secrets mapping` stack

    * dependency: kafka, secretsmanager stack

    ```bash
    cdk deploy public-msk-kafka-secrets-mapping-stack
    ```

5. Deploy the `ec2 bastion` stack

    * dependency: vpc stack

    ```bash
    cdk deploy public-msk-ec2-bastion-stack
    ```
