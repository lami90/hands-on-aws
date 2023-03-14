#!/usr/bin/env bash

SCRIPT_DIR=$(dirname $0)

read -p "Enter username: " username
read -p "Enter password: " password

# check if username or password is empty
if [ -z "$username" ] || [ -z "$password" ]; then
    echo "username or password is empty"
    exit 1
fi

# create the users_jaas.conf file to ../consumer/docker
touch ./$SCRIPT_DIR/users_jaas.conf
# add the content to users_jaas.conf
echo "org.apache.kafka.common.security.scram.ScramLoginModule required serviceName=\"kafkaClient\" username=\"$username\" password=\"$password\";" > ./$SCRIPT_DIR/users_jaas.conf
