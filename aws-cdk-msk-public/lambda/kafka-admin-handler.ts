import { response } from 'cfn-response';
import { AclOperationTypes, AclPermissionTypes, AclResourceTypes, Kafka, ResourcePatternTypes } from 'kafkajs';
import {
    ACL_OPERATION_TYPE,
    ACL_PERMISSION_TYPE, ACL_RESOURCE_PATTERN_TYPE,
    ACL_RESOURCE_TYPE,
    AclRequestType,
    Request,
    TopicRequestType
} from "./request";

export const handler = async (event: any = {}, context: any = {}): Promise<any> => {
    const BROKERS: string[] | undefined = process.env.BOOTSTRAP_ADDRESS?.split(',');
    const USERNAME: string | undefined = process.env.USERNAME;
    const PASSWORD: string | undefined = process.env.PASSWORD;
    if (!BROKERS || !USERNAME || !PASSWORD) {
        throw new Error('Missing environment variables');
    }

    console.log(`BROKERS: ${BROKERS}`);
    console.log(`USERNAME: ${USERNAME}`);
    console.log(`PASSWORD: ${PASSWORD}`);

    const admin = await initKafkaAdmin(BROKERS, USERNAME, PASSWORD);

    const request = event as Request;
    console.log(`request: ${JSON.stringify(request)}`);
    try {
        if (request.type === TopicRequestType) {
            if (request.operation === 'CREATE') {
                let result = await createTopic(admin, request.topic);
                console.log(`Topic created: ${result}`)
                response.send(event, context, response.SUCCESS, {alreadyExists: !result});
            } else if (event.operation === 'DELETE') {
                await deleteTopic(admin, request.topic);
                console.log(`Topic deleted`)
                response.send(event, context, response.SUCCESS, {deleted: true});
            } else if (event.operation === 'LIST') {
                const topics = await listTopics(admin);
                console.log(`Topics: ${JSON.stringify(topics)}`)
            } else if (event.operation === 'FETCH') {
                if (!request.topic) {
                    throw new Error('Missing topic name');
                }
                const topic = await fetchTopic(admin, request.topic);
                console.log(`Topic: ${JSON.stringify(topic)}`)
            } else {
                throw new Error(`Unknown operation: ${request.operation}`);
            }
        } else if (request.type === AclRequestType) {
            if (request.operation === 'CREATE') {
                let result = await createAcl(
                    admin,
                    request.resourceType,
                    request.resourceName,
                    request.resourcePatternType,
                    request.principalUser,
                    request.operationType,
                    request.permissionType
                );
                console.log(`ACL created: ${result}`)
                // response.send(event, context, response.SUCCESS, {alreadyExists: !result});
            } else if (event.operation === 'DELETE') {
                await deleteAcl(
                    admin,
                    request.resourceType,
                    request.resourceName,
                    request.resourcePatternType,
                    request.principalUser,
                    request.operationType,
                    request.permissionType
                );
                console.log(`ACL deleted`)
                // response.send(event, context, response.SUCCESS, {deleted: true});
            } else {
                throw new Error(`Unknown operation: ${request.operation}`);
            }
        }
    } catch (e) {
        console.log(`Error: ${e}`);
    }
}

async function initKafkaAdmin(brokers: string[], username: string, password: string): Promise<any> {
    const kafka = new Kafka({
        clientId: 'kafka-admin-api-handler',
        brokers: brokers,
        ssl: true,
        sasl: {
            mechanism: 'scram-sha-512',
            username: username,
            password: password,
        },
        // logLevel: logLevel.DEBUG,
    });
    return kafka.admin();
}

async function createTopic(admin: any, topic?: string, numPartitions = 3, replicationFactor = 3): Promise<boolean> {
    if (!topic) {
        throw new Error('Missing topic name');
    }
    console.debug("Connecting to kafka admin...");
    await admin.connect();
    console.log(`Creating topic: ${topic}...numPartitions: ${numPartitions}, replicationFactor: ${replicationFactor}`);
    let result = await admin.createTopics({topics: [{topic: topic, numPartitions: numPartitions, replicationFactor: replicationFactor}]});
    console.debug(`Topic created`);
    await admin.disconnect()
    return result;
}

async function deleteTopic(admin: any, topic?: string): Promise<void> {
    if (!topic) {
        throw new Error('Missing topic name');
    }
    console.debug("Connecting to kafka admin...");
    await admin.connect();
    console.debug(`Deleting topic: ${topic}...`);
    await admin.deleteTopics({topics: [topic]});
    console.debug("Topic deleted");
    await admin.disconnect();
    return;
}

async function listTopics(admin: any): Promise<void> {
    console.debug("Connecting to kafka admin...");
    await admin.connect();
    console.debug("Listing topics...");
    const topics = await admin.listTopics();
    await admin.disconnect();
    return topics;
}

async function fetchTopic(admin: any, topic: string): Promise<void> {
    console.debug("Connecting to kafka admin...");
    await admin.connect();
    console.debug(`Describing topic: ${topic}...`);
    const topics = await admin.fetchTopicMetadata({topics: [topic]});
    await admin.disconnect();
    return topics;
}

async function createAcl(
    admin: any,
    resourceType: ACL_RESOURCE_TYPE,
    resourceName = '*',
    resourcePatternType: ACL_RESOURCE_PATTERN_TYPE,
    principalUser: string,
    operationType: ACL_OPERATION_TYPE,
    permissionType: ACL_PERMISSION_TYPE,
): Promise<void> {
    console.debug("Connecting to kafka admin...");
    await admin.connect();
    console.debug(`Creating ACLs: ${resourceType}, ${resourceName}, ${resourcePatternType}, ${principalUser}, ${operationType}, ${permissionType}...`);

    const acl = {
        resourceType: AclResourceTypes[resourceType as keyof typeof AclResourceTypes],
        resourceName: resourceName,
        resourcePatternType: ResourcePatternTypes[resourcePatternType as keyof typeof ResourcePatternTypes],
        principal: `User:${principalUser}`,
        host: '*',
        operation: AclOperationTypes[operationType as keyof typeof AclOperationTypes],
        permissionType: AclPermissionTypes[permissionType as keyof typeof AclPermissionTypes],
        patternFilter: null,
    }

    console.log(`ACL: ${JSON.stringify(acl)}...`);
    await admin.createAcls({ acl: [acl] });
    console.debug("ACLs created");
    await admin.disconnect();
    return;
}

async function deleteAcl(
    admin: any,
    resourceType: ACL_RESOURCE_TYPE,
    resourceName = '*',
    resourcePatternType: ACL_RESOURCE_PATTERN_TYPE,
    principalUser: string,
    operationType: ACL_OPERATION_TYPE,
    permissionType: ACL_PERMISSION_TYPE,
): Promise<void> {
    console.debug("Connecting to kafka admin...");
    await admin.connect();
    console.debug(`Deleting ACLs: ${resourceType}, ${resourceName}, ${resourcePatternType}, ${principalUser}, ${operationType}, ${permissionType}...`);

    const acl = {
        resourceType: AclResourceTypes[resourceType as keyof typeof AclResourceTypes],
        resourceName: resourceName,
        resourcePatternType: ResourcePatternTypes[resourcePatternType as keyof typeof ResourcePatternTypes],
        principal: `User:${principalUser}`,
        host: '*',
        operation: AclOperationTypes[operationType as keyof typeof AclOperationTypes],
        permissionType: AclPermissionTypes[permissionType as keyof typeof AclPermissionTypes],
    }

    console.log(`ACL: ${JSON.stringify(acl)}...`);
    await admin.deleteAcls({ filters: [acl] });
    console.debug("ACLs deleted");
    await admin.disconnect();
    return;
}
