import { createClient } from 'redis';

export const redisClient = createClient({
  url: 'redis://localhost:6379',
});

redisClient.connect().catch(console.error);
