import fs  from 'fs';
import { Kafka, Producer, Consumer, Partitioners, logLevel } from 'kafkajs';
import path from 'path';

const kafka = new Kafka({
  // clientId: 'eurora-app',
  brokers: [`${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`],
  ssl : {
    ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")]
  },
  sasl : {
    username : process.env.KAFKA_USERNAME!,
    password : process.env.KAFKA_PASSWORD!,
    mechanism: "plain"
  },
  logLevel: logLevel.ERROR
});

const producer: Producer = kafka.producer({createPartitioner: Partitioners.LegacyPartitioner,}) // Add this to retain old behavior});
const consumer: Consumer = kafka.consumer({ groupId: 'eurora-app-group' });

const connectKafka = async () => {
  const admin = kafka.admin();
  await admin.connect();
  console.log("✅ Connected to Kafka Admin");

  // Fetch metadata to ensure Kafka knows about the topic
  await admin.fetchTopicMetadata({ topics: [] }); 

  await producer.connect();
  await consumer.connect();
  console.log('✅ Connected to Kafka Producer and Consumer');
  
  await admin.disconnect();
};


const sendMessageToKafka = async (topic: string, message: string) => {
  await producer.send({
    topic,
    messages: [{ value: message, partition: 0 }],
  });
};

const consumeMessages = async (topic: string, callback: (message: string) => void) => {
  await consumer.subscribe({ topic, fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (message.value) {
        callback(message.value.toString());
      }
    },
  });
};

export { connectKafka, sendMessageToKafka, consumeMessages };