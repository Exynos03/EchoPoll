import Redis from 'ioredis';

const redisClient: Redis = new Redis({
  host: process.env.REDIS_HOST as string,
  port: parseInt(process.env.REDIS_PORT as string, 10),
  username: process.env.REDIS_USERNAME as string,
  password: process.env.REDIS_PASSWORD as string,
});

redisClient.on('error', (err: Error) => console.error('Redis Client Error', err));

const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.ping(); // Simple check to confirm connection
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis', error);
  }
};

const publishMessage = async (channel: string, message: string): Promise<void> => {
  await redisClient.publish(channel, message);
};

const subscribeToChannel = async (channel: string, callback: (message: string) => void): Promise<void> => {
  const subscriber: Redis = redisClient.duplicate();
  
  await subscriber.subscribe(channel);
  console.log(`Subscribed to channel: ${channel}`);
  
  subscriber.on('message', (subscribedChannel: string, message: string) => {
    if (subscribedChannel === channel) {
      callback(message);
    }
  });
};

export { connectRedis, publishMessage, subscribeToChannel };
