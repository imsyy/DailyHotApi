import type { Get, Post, Web } from "../types.js";
import type { Page } from "puppeteer";
import { config } from "../config.js";
import { getCache, setCache, delCache } from "./cache.js";
import { Cluster } from "puppeteer-cluster";
import logger from "./logger.js";
import axios from "axios";

// 基础配置
const request = axios.create({
  // 请求超时设置
  timeout: config.REQUEST_TIMEOUT,
  withCredentials: true,
});

// Puppeteer Cluster
let cluster: Cluster | null = null;

/**
 * 创建 Puppeteer Cluster
 * @returns {Promise<Cluster|null>} Puppeteer Cluster
 */
export const createCluster = async (): Promise<Cluster | null> => {
  if (cluster) return cluster;
  try {
    cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_BROWSER,
      maxConcurrency: 5,
      puppeteerOptions: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-gpu",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      },
    });
    logger.info("Puppeteer Cluster 已成功初始化");
  } catch (error) {
    logger.warn("启动 Puppeteer Cluster 失败，可能是没有 Chromium 安装", error);
    cluster = null;
  }
  return cluster;
};

/**
 * 处理任务
 * @param page 页面
 * @param data 数据
 * @returns
 */
const taskHandler = async ({
  page,
  data: { url, userAgent },
}: {
  page: Page;
  data: { url: string; userAgent?: string };
}): Promise<string> => {
  // 用户代理
  if (userAgent) await page.setUserAgent(userAgent);
  // 请求拦截
  await page.setRequestInterception(true);
  // 拦截非必要资源
  page.on("request", (request) => {
    const type = request.resourceType();
    if (type === "document" || type === "script") {
      request.continue();
    } else {
      request.abort();
    }
  });
  // 加载页面
  await page.goto(url, { waitUntil: "networkidle0", timeout: config.REQUEST_TIMEOUT });
  // 返回页面内容
  return page.content();
};

// 请求拦截
request.interceptors.request.use(
  (request) => {
    if (!request.params) request.params = {};
    // 发送请求
    return request;
  },
  (error) => {
    logger.error("请求失败，请稍后重试");
    return Promise.reject(error);
  },
);

// 响应拦截
request.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 继续传递错误
    return Promise.reject(error);
  },
);

// GET
export const get = async (options: Get) => {
  const { url, headers, params, noCache, ttl = config.CACHE_TTL, originaInfo = false } = options;
  logger.info("发起 GET 请求", options);
  try {
    // 检查缓存
    if (noCache) delCache(url);
    else {
      const cachedData = getCache(url);
      if (cachedData) {
        logger.info("采用缓存", { url });
        return { fromCache: true, data: cachedData.data, updateTime: cachedData.updateTime };
      }
    }
    // 缓存不存在时请求接口
    logger.info("请求接口", { url });
    const response = await request.get(url, { headers, params });
    const responseData = response?.data || response;
    // 存储新获取的数据到缓存
    const updateTime = new Date().toISOString();
    const data = originaInfo ? response : responseData;
    setCache(url, { data, updateTime }, ttl);
    // 返回数据
    logger.info("接口调用成功", { status: response?.statusText });
    return { fromCache: false, data, updateTime };
  } catch (error) {
    logger.error("GET 请求出错", error);
    throw error;
  }
};

// POST
export const post = async (options: Post) => {
  const { url, headers, body, noCache, ttl = config.CACHE_TTL, originaInfo = false } = options;
  logger.info("发起 POST 请求", options);
  try {
    // 检查缓存
    if (noCache) delCache(url);
    else {
      const cachedData = getCache(url);
      if (cachedData) {
        logger.info("采用缓存", { url });
        return { fromCache: true, data: cachedData.data, updateTime: cachedData.updateTime };
      }
    }
    // 缓存不存在时请求接口
    logger.info("请求接口", { url });
    const response = await request.post(url, body, { headers });
    const responseData = response?.data || response;
    // 存储新获取的数据到缓存
    const updateTime = new Date().toISOString();
    const data = originaInfo ? response : responseData;
    if (!noCache) {
      setCache(url, { data, updateTime }, ttl);
    }
    // 返回数据
    logger.info("接口调用成功", { status: response?.statusText });
    return { fromCache: false, data, updateTime };
  } catch (error) {
    logger.error("POST 请求出错", error);
    throw error;
  }
};

// WEB - Puppeteer
export const web = async (options: Web) => {
  const { url, noCache, ttl = config.CACHE_TTL, userAgent } = options;
  logger.info("使用 Puppeteer 发起页面请求", options);
  if (config.USE_PUPPETEER === false) {
    return {
      fromCache: false,
      data: [],
      message: "Puppeteer is not enabled, please set USE_PUPPETEER=true",
      updateTime: 0,
    };
  }
  // 初始化 Cluster
  const clusterInstance = await createCluster();
  if (!clusterInstance) {
    logger.error("Cluster 初始化失败，无法继续");
    throw new Error("Cluster 初始化失败");
  }
  try {
    // 检查缓存
    if (noCache) {
      delCache(url);
    } else {
      const cachedData = getCache(url);
      if (cachedData) {
        logger.info("采用缓存", { url });
        return { fromCache: true, data: cachedData.data, updateTime: cachedData.updateTime };
      }
    }
    // 缓存不存在时使用 Puppeteer 请求页面
    logger.info("启动浏览器请求页面", { url });
    const pageContent = await clusterInstance.execute({ url, userAgent }, taskHandler);
    // 存储新获取的数据到缓存
    const updateTime = new Date().toISOString();
    setCache(url, { data: pageContent, updateTime }, ttl);
    // 返回数据
    logger.info("页面内容获取成功");
    return { fromCache: false, data: pageContent, updateTime };
  } catch (error) {
    logger.error("Puppeteer 请求出错", error);
    throw error;
  }
};

/**
 * 关闭 Cluster
 */
export const closeCluster = async () => {
  if (cluster) {
    try {
      await cluster.close();
      logger.info("Puppeteer Cluster 已成功关闭");
    } catch (error) {
      logger.error("关闭 Puppeteer Cluster 时出错", error);
    }
  }
};
