import fs  from 'fs';
import { Kafka, Producer, Consumer, Partitioners  } from 'kafkajs';
import path from 'path';

const kafka = new Kafka({
  clientId: 'qna-app',
  brokers: [`${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`],
  ssl : {
    ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")]
  },
  sasl : {
    username : process.env.KAFKA_USERNAME!,
    password : process.env.KAFKA_PASSWORD!,
    mechanism: "plain"
  },

});

const producer: Producer = kafka.producer({createPartitioner: Partitioners.LegacyPartitioner,}) // Add this to retain old behavior});
const consumer: Consumer = kafka.consumer({ groupId: 'eurora-app-group' });

const connectKafka = async () => {
  await producer.connect();
  await consumer.connect();
  console.log('Connected to Kafka');
};

const sendMessage = async (topic: string, message: string) => {
  await producer.send({
    topic,
    messages: [{ value: message }],
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

export { connectKafka, sendMessage, consumeMessages };