import { config } from "../config.js";
import NodeCache from "node-cache";
import logger from "./logger.js";

// init
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

interface GetCache<T> {
  updateTime: string;
  data: T;
}

// 从缓存中获取数据
export const getCache = <T>(key: string): GetCache<T> | undefined => {
  return cache.get(key);
};

// 将数据写入缓存
export const setCache = <T>(key: string, value: T, ttl: number = config.CACHE_TTL) => {
  const success = cache.set(key, value, ttl);
  if (logger) logger.info("数据缓存成功", { url: key });
  return success;
};

// 从缓存中删除数据
export const delCache = (key: string) => {
  return cache.del(key);
};
