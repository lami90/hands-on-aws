#!/bin/bash -xe

# Update with optional user data that will run on instance start.
# Learn more about user-data: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html

sudo curl -L https://corretto.aws/downloads/latest/amazon-corretto-11-x64-linux-jdk.rpm -o jdk11.rpm

sudo yum install -y jdk11.rpm

# download kafka 3.3.2 binary
wget https://downloads.apache.org/kafka/3.3.2/kafka_2.13-3.3.2.tgz

# untar kafka binary
tar -xzf kafka_2.13-3.3.2.tgz

# move kafka binary to /opt/kafka
sudo mv kafka_2.13-3.3.2 /opt/kafka

# environment variables does not work in user-data, so we need to set them in the script
cd ${HOME}

echo \# kafka environment variables >> .bashrc
echo export KAFKA_HOME=/opt/kafka >> .bashrc
echo export PATH=\$PATH:\$KAFKA_HOME/bin >> .bashrc

source ~/.bashrc
