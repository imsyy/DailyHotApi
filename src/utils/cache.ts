import { config } from "../config.js";
import logger from "./logger.js";
import NodeCache from "node-cache";
import Redis from "ioredis";

interface CacheData {
  updateTime: string;
  data: unknown;
}

// init NodeCache
const cache = new NodeCache({
  // 缓存过期时间（ 秒 ）
  stdTTL: config.CACHE_TTL,
  // 定期检查过期缓存（ 秒 ）
  checkperiod: 600,
  // 克隆变量
  useClones: false,
  // 最大键值对
  maxKeys: 100,
});

// init Redis client
const redis = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD,
  // 仅在第一次建立连接
  lazyConnect: true,
});

// Redis 是否可用
let isRedisAvailable: boolean = false;
let isRedisTried: boolean = false;

// Redis 连接错误
redis.on("error", (err) => {
  if (!isRedisTried) {
    isRedisAvailable = false;
    isRedisTried = true;
    logger.error(
      `📦 [Redis] connection failed: ${err instanceof Error ? err.message : "Unknown error"}`,
    );
  }
});

// Redis 连接状态
const ensureRedisConnection = async () => {
  if (!isRedisTried) {
    try {
      await redis.connect();
      isRedisAvailable = true;
      isRedisTried = true;
      logger.info("📦 [Redis] connected successfully.");
    } catch (error) {
      isRedisAvailable = false;
      isRedisTried = true;
      logger.error(
        `📦 [Redis] connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
};

/**
 * 从缓存中获取数据
 * @param key 缓存键
 * @returns 缓存数据
 */
export const getCache = async (key: string): Promise<CacheData | undefined> => {
  await ensureRedisConnection();
  if (isRedisAvailable) {
    try {
      const redisResult = await redis.get(key);
      if (redisResult) {
        const data = JSON.parse(redisResult);
        return data;
      }
    } catch (error) {
      logger.error(
        `📦 [Redis] get error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
  return cache.get(key);
};

/**
 * 将数据写入缓存
 * @param key 缓存键
 * @param value 缓存值
 * @param ttl 缓存过期时间（ 秒 ）
 * @returns 是否写入成功
 */
export const setCache = async (
  key: string,
  value: CacheData,
  ttl: number = config.CACHE_TTL,
): Promise<boolean> => {
  // 尝试写入 Redis
  if (isRedisAvailable && !Buffer.isBuffer(value?.data)) {
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttl);
      if (logger) logger.info(`💾 [REDIS] ${key} has been cached`);
    } catch (error) {
      logger.error(
        `📦 [Redis] set error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
  const success = cache.set(key, value, ttl);
  if (logger) logger.info(`💾 [NodeCache] ${key} has been cached`);
  return success;
};

/**
 * 从缓存中删除数据
 * @param key 缓存键
 * @returns 是否删除成功
 */
export const delCache = async (key: string): Promise<boolean> => {
  let redisSuccess = true;
  if (isRedisAvailable) {
    try {
      await redis.del(key);
      if (logger) logger.info(`🗑️ [REDIS] ${key} has been deleted from Redis`);
    } catch (error) {
      logger.error(
        `📦 [Redis] del error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      redisSuccess = false;
    }
  }
  // 尝试删除 NodeCache
  const nodeCacheSuccess = cache.del(key) > 0;
  if (logger) logger.info(`🗑️ [CACHE] ${key} has been deleted from NodeCache`);
  return redisSuccess && nodeCacheSuccess;
};
