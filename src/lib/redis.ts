import Redis from "ioredis";

// Use environment variable if defined, else fallback to local Redis
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,  // Important for BullMQ
});

export { connection };
