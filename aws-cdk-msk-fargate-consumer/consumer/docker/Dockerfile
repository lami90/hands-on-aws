FROM --platform=linux/amd64 amazonlinux:2
RUN yum update -y
RUN yum install awslogs -y
RUN yum install amazon-cloudwatch-agent -y
RUN yum install java-11-amazon-corretto-headless -y
RUN cp /usr/lib/jvm/java-11-amazon-corretto.x86_64/lib/security/cacerts /tmp/kafka.client.truststore.jks
ENV TRUST_STORE_LOCATION=/tmp/kafka.client.truststore.jks

COPY kafka-consumer-1.0-SNAPSHOT-shaded.jar /opt/
COPY users_jaas.conf /opt/
ENV KAFKA_OPTS="-Djava.security.auth.login.config=/opt/users_jaas.conf"

WORKDIR /opt/
ENTRYPOINT java -cp kafka-consumer-1.0-SNAPSHOT-shaded.jar amazon.aws.samples.kafka.ConsumerApplication
