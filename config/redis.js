const { createClient } = require('redis');

const redisClient = createClient({ socket: { host: 'localhost', port: 6379 } });

// Wrap connection in a function
async function connectRedis() {
  try {
    await redisClient.connect();
    console.log('✅ Redis connected');
  } catch (err) {
    console.error('❌ Redis connection failed:', err.message);
    process.exit(1);
  }
}

connectRedis(); // Call it but don't await at top level

module.exports = redisClient;