const NodeCache = require("node-cache");

const cache = new NodeCache({
  stdTTL: 1800, // 缓存默认过期时间（单位秒）
  checkperiod: 60, // 定期检查过期缓存的时间（单位秒）
});

/**
 * 从缓存中获取数据
 * @param {string} key 缓存键值
 * @return {Promise<any>} 数据
 */
const get = async (key) => {
  return cache.get(key);
};

/**
 * 将数据写入缓存
 * @param {string} key 缓存键值
 * @param {any} value 数据
 * @param {number} ttl 有效期，单位秒，默认为300秒
 * @return {Promise<void>} 无返回值
 */
const set = async (key, value, ttl = 300) => {
  return cache.set(key, value, ttl);
};

/**
 * 从缓存中删除数据
 * @param {string} key 缓存键值
 * @return {Promise<void>} 无返回值
 */
const del = async (key) => {
  return cache.del(key);
};

module.exports = {
  get,
  set,
  del,
};
