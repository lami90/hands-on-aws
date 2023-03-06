import { AclOperationTypes, AclPermissionTypes, AclResourceTypes, Kafka, logLevel, ResourcePatternTypes } from 'kafkajs';

export const handler = async (event: any = {}): Promise<any> => {
    const BROKERS: string[] | undefined = process.env.BOOTSTRAP_ADDRESS?.split(',');
    const USERNAME: string | undefined = process.env.USERNAME;
    const PASSWORD: string | undefined = process.env.PASSWORD;
    if (!BROKERS || !USERNAME || !PASSWORD) {
        throw new Error('Missing environment variables');
    }

    console.log(`BROKERS: ${BROKERS}`);
    console.log(`USERNAME: ${USERNAME}`);
    console.log(`PASSWORD: ${PASSWORD}`);

    const kafka = new Kafka({
        logLevel: logLevel.DEBUG,
        clientId: 'kafka-init-app',
        brokers: BROKERS,
        ssl: true,
        sasl: {
            mechanism: 'scram-sha-512',
            username: USERNAME,
            password: PASSWORD
        }
    });
    const admin = kafka.admin();

    // test
    const topicConfig = {
        topic: 'test-topic',
        numPartitions: 1,
        replicationFactor: 3,
    };
    console.debug("Connecting to kafka admin...");
    await admin.connect();
    console.debug(`Creating topic: ${JSON.stringify(topicConfig)}...`);
    let result = await admin.createTopics({topics: [topicConfig]});
    console.debug(`Topic created`);
    await admin.disconnect()

    await admin.connect();
    console.log('Connecting to kafka admin...');
    const acl = [
        {
            resourceType: AclResourceTypes.CLUSTER,
            resourceName: '*',
            resourcePatternType: ResourcePatternTypes.ANY,
            principal: `User:${USERNAME}`,
            host: '*',
            operation: AclOperationTypes.ALL,
            permissionType: AclPermissionTypes.ALLOW,
            patternFilter: null,
        }
    ]
    console.log(`Creating ACLs: ${JSON.stringify(acl)}`);
    await admin.createAcls({ acl });
    console.log('ACLs created');
    await admin.disconnect();
    console.log('Disconnected from kafka admin');
}

