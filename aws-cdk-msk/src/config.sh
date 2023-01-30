#!/bin/bash -xe

# Update with optional user data that will run on instance start.
# Learn more about user-data: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html

# download kafka 3.3.2 binary
wget https://downloads.apache.org/kafka/3.3.2/kafka_2.13-3.3.2.tgz

# untar kafka binary
tar -xzf kafka_2.13-3.3.2.tgz
