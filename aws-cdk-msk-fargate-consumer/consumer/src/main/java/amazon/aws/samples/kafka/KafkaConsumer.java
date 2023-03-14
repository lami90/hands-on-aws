package amazon.aws.samples.kafka;

import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.TopicPartition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Component
public class KafkaConsumer {
    private static final Logger LOGGER = LoggerFactory.getLogger(KafkaConsumer.class);

    private final AdminClient adminClient;

    private final KafkaConsumerProperties properties;
    private final String uuid;

    public KafkaConsumer(AdminClient adminClient, KafkaConsumerProperties properties) {
        this.adminClient = adminClient;
        this.properties = properties;
        uuid = UUID.randomUUID().toString();
        LOGGER.info("Starting KafkaConsumer: " + uuid);
    }

    @KafkaListener(groupId = "#{kafkaConsumerProperties.groupId}", topics = {"#{kafkaConsumerProperties.topic}"}, containerFactory = "kafkaListenerContainerFactory")
    public void listen(Message message) {
        LOGGER.info("Received message key: {}, data: {}, bridgedAt: {}", message.getKey(), message.getData(), message.getBridgedAt());
    }

    @PostConstruct
    public void postConstruct() throws ExecutionException, InterruptedException {
        LOGGER.info("Topic metadata");
        Map<TopicPartition, OffsetAndMetadata> metadataMap = adminClient.listConsumerGroupOffsets(properties.getGroupId()).partitionsToOffsetAndMetadata().get();
        for (Map.Entry<TopicPartition, OffsetAndMetadata> entry : metadataMap.entrySet()) {
            LOGGER.info(entry.getKey().toString() + " " + entry.getValue().metadata());
        }
    }
}
