let client = null;
let available = false;

async function init() {
  if (client || available) return;
  try {
    // require dynamically so the app still loads if `redis` isn't installed
    const { createClient } = require('redis');
    client = createClient({ url: process.env.REDIS_URL || undefined });
    client.on('error', (err) => console.error('Redis Client Error', err));
    await client.connect();
    available = true;
    console.log('Redis client connected');
  } catch (err) {
    // redis not available or connection failed — degrade gracefully
    console.warn('Redis not available, running without cache:', err.message);
    client = null;
    available = false;
  }
}

async function get(key) {
  try {
    await init();
    if (!available) return null;
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.warn('Redis get error:', err.message);
    return null;
  }
}

async function set(key, value, ttlSeconds = 60) {
  try {
    await init();
    if (!available) return;
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (err) {
    console.warn('Redis set error:', err.message);
  }
}

module.exports = { get, set };
