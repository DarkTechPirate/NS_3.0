const { Queue } = require("bullmq");
const Redis = require("ioredis");

const connection = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1", // Default to localhost if not specified
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: Number(process.env.REDIS_DB) || 0,
    maxRetriesPerRequest: null,
});

// 2. Create the Queue
const mediaQueue = new Queue("media-processing", { connection });
// Placeholder queues if needed later
const notificationQueue = new Queue("notification-queue", { connection });
const orderProcessingQueue = new Queue("order-processing-queue", {
    connection,
});

module.exports = {
    mediaQueue,
    notificationQueue,
    connection,
    orderProcessingQueue,
};
