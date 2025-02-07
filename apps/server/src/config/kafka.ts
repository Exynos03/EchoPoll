import fs from "fs";
import { Kafka, Producer, Consumer, Partitioners, logLevel } from "kafkajs";
import path from "path";

const kafka = new Kafka({
  // clientId: 'eurora-app',
  brokers: [`${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`],
  ssl: {
    ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
  },
  sasl: {
    username: process.env.KAFKA_USERNAME!,
    password: process.env.KAFKA_PASSWORD!,
    mechanism: "plain",
  },
  // logLevel: logLevel.ERROR
});

const producer: Producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
}); // Add this to retain old behavior});
const consumer: Consumer = kafka.consumer({ groupId: "room-chat" });

const connectKafka = async () => {
  await producer.connect();
  await consumer.connect();

  // Force metadata refresh
  const admin = kafka.admin();
  await admin.connect();
  await admin.fetchTopicMetadata({ topics: ["room-chat"] });
  await admin.disconnect();

  console.log("✅ Connected to Kafka Producer and Consumer");
};

const sendMessageToKafka = async (topic: string, message: string) => {
  await producer.send({
    topic,
    messages: [{ value: message }], // Remove partition: 0 to let Kafka decide
  });
};

const consumeMessages = async (
  topic: string,
  callback: (message: string) => void,
) => {
  console.log(`📌 Subscribing to topic: ${topic}`);

  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (message.value) {
        callback(message.value.toString());
      }
    },
  });

  console.log(`✅ Successfully subscribed to ${topic}`);
};

export { connectKafka, sendMessageToKafka, consumeMessages };
