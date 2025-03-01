const Redis = require('ioredis');
const logger = require('./logger');

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

redis.on('error', (err) => {
    logger.error('Redis Client Error', err);
});

redis.on('connect', () => {
    logger.info('Redis Client Connected');
});

const DEFAULT_EXPIRATION = 3600; // 1 hour in seconds

const cache = {
    async get(key) {
        try {
            const value = await redis.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            logger.error('Redis Get Error:', error);
            return null;
        }
    },

    async set(key, value, expiration = DEFAULT_EXPIRATION) {
        try {
            await redis.setex(key, expiration, JSON.stringify(value));
        } catch (error) {
            logger.error('Redis Set Error:', error);
        }
    },

    async del(key) {
        try {
            await redis.del(key);
        } catch (error) {
            logger.error('Redis Delete Error:', error);
        }
    },

    async flush() {
        try {
            await redis.flushall();
        } catch (error) {
            logger.error('Redis Flush Error:', error);
        }
    }
};

// Middleware for caching responses
const cacheMiddleware = (duration = DEFAULT_EXPIRATION) => {
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        const key = `cache:${req.originalUrl}`;

        try {
            const cachedResponse = await cache.get(key);
            if (cachedResponse) {
                return res.json(cachedResponse);
            }

            // Store the original res.json function
            const originalJson = res.json.bind(res);
            
            // Override res.json method to cache the response
            res.json = (body) => {
                cache.set(key, body, duration);
                return originalJson(body);
            };

            next();
        } catch (error) {
            logger.error('Cache Middleware Error:', error);
            next();
        }
    };
};

module.exports = {
    cache,
    cacheMiddleware,
    redis
}; 