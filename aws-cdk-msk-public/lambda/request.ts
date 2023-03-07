
export type Request = TopicRequest | AclRequest;

export const TopicRequestType = 'TopicRequest';
export type TOPIC_REQUEST_OPERATION_TYPE = 'CREATE' | 'UPDATE' | 'DELETE' | 'LIST' | 'FETCH';
export const AclRequestType = 'AclRequest';
export type ACL_REQUEST_OPERATION_TYPE = 'CREATE' | 'ALTER' | 'REMOVE' | 'DESCRIBE';

export type ACL_RESOURCE_TYPE = 'UNKNOWN' | 'ANY' | 'TOPIC' | 'GROUP' | 'CLUSTER' | 'TRANSACTIONAL_ID' | 'DELEGATION_TOKEN';
export type ACL_RESOURCE_PATTERN_TYPE = 'UNKNOWN' | 'ANY' | 'MATCH' | 'LITERAL' | 'PREFIXED';
export type ACL_OPERATION_TYPE = 'UNKNOWN' | 'ANY' | 'ALL' | 'READ' | 'WRITE' | 'CREATE' | 'DELETE' | 'ALTER' | 'DESCRIBE' | 'CLUSTER_ACTION' | 'DESCRIBE_CONFIGS' | 'ALTER_CONFIGS' | 'IDEMPOTENT_WRITE';
export type ACL_PERMISSION_TYPE = 'UNKNOWN' | 'ANY' | 'DENY' | 'ALLOW';
export interface TopicRequest {

    readonly type: typeof TopicRequestType;
    readonly operation: TOPIC_REQUEST_OPERATION_TYPE;
    readonly topic?: string;
}

/**
 * Request Example:
 * ${USERNAME} is the username of the user that will be used to connect to the Kafka cluster
    {
        "type": "AclRequest",
        "operation": "CREATE",
        "principalUser": "${USERNAME}",
        "resourceType": "CLUSTER",
        "resourceName": "kafka-cluster",
        "resourcePatternType": "LITERAL",
        "operationType": "ALL",
        "permissionType": "ALLOW"
    }

 * ${USERNAME} is the username of the user that will be dealing with the topics
    {
        "type": "AclRequest",
        "operation": "CREATE",
        "principalUser": "${USERNAME}",
        "resourceType": "TOPIC",
        "resourceName": "*",
        "resourcePatternType": "LITERAL",
        "operationType": "ALL",
        "permissionType": "ALLOW"
    }
 */

export interface AclRequest {
    readonly type: typeof AclRequestType;
    readonly operation: ACL_REQUEST_OPERATION_TYPE;
    readonly principalUser: string;
    readonly resourceType: ACL_RESOURCE_TYPE;
    readonly resourceName: string;
    readonly resourcePatternType: ACL_RESOURCE_PATTERN_TYPE;
    readonly operationType: ACL_OPERATION_TYPE;
    readonly permissionType: ACL_PERMISSION_TYPE;
}
