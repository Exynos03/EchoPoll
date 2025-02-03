import { Kafka, Producer, Consumer } from 'kafkajs';
import fs from 'fs'
import path from 'path';

// Kafka configuration
const kafka = new Kafka({
//   clientId: 'qna-app', // Unique identifier for the client
    brokers: [process.env.KAFKA_HOST!] , // Kafka broker addresses
    ssl : {
        ca : [fs.readFileSync(path.resolve("./ca.pem"), 'utf-8')]
    },
    sasl : {
        username: process.env.KAFKA_USERNAME!,
        password: process.env.KAFKA_PASSWORD!,
        mechanism: "plain"
    }
});

// Create a Kafka producer instance
export const kafkaProducer = kafka.producer();

// Create a Kafka consumer instance
export const kafkaConsumer = kafka.consumer({ groupId: 'eurora-app-group' });

// Function to connect Kafka producer and consumer
export const connectKafka = async () => {
  try {
    await kafkaProducer.connect();
    await kafkaConsumer.connect();
    console.log('Connected to Kafka successfully');
  } catch (error) {
    console.error('Failed to connect to Kafka:', error);
    throw error;
  }
};

// Function to disconnect Kafka producer and consumer
export const disconnectKafka = async () => {
  try {
    await kafkaProducer.disconnect();
    await kafkaConsumer.disconnect();
    console.log('Disconnected from Kafka successfully');
  } catch (error) {
    console.error('Failed to disconnect from Kafka:', error);
    throw error;
  }
};