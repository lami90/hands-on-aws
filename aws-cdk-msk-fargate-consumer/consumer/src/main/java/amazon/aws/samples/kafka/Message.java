package amazon.aws.samples.kafka;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Message {
    private String key;
    private String data;
    private long bridgedAt;

    public Message(@JsonProperty("key") String key, @JsonProperty("data") String data, @JsonProperty("bridgedAt") long bridgedAt) {
        this.key = key;
        this.data = data;
        this.bridgedAt = bridgedAt;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public long getBridgedAt() {
        return bridgedAt;
    }

    public void setBridgedAt(long bridgedAt) {
        this.bridgedAt = bridgedAt;
    }
}

