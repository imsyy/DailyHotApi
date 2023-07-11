/*
 * @Descripttion: 
 * @version: 
 * @Author: WangPeng
 * @Date: 2023-07-11 16:41:48
 * @LastEditors: WangPeng
 * @LastEditTime: 2023-07-11 16:56:12
 */
/*
 * @Descripttion:
 * @version:
 * @Author: WangPeng
 * @Date: 2023-07-10 16:56:01
 * @LastEditors: WangPeng
 * @LastEditTime: 2023-07-11 16:33:56
 */
const Router = require("koa-router");
const douyinRouter = new Router();
const axios = require("axios");
const { get, set, del } = require("../utils/cacheData");

// 缓存键名
const cacheKey = "douyinData";

// 调用时间
let updateTime = new Date().toISOString();

// 调用路径
const url = "https://aweme.snssdk.com/aweme/v1/chart/music/list/";
const HEADERS = {
  'user-agent': 'okhttp3'
}
const QUERIES = {
  'device_platform': 'android',
  'version_name': '13.2.0',
  'version_code': '130200',
  'aid': '1128',
  'chart_id': '6853972723954146568', 
  'count': '100'
}

// 数据处理
const getData = (data) => {
  if (!data) return [];
  return data;
};

// 抖音music热榜
douyinRouter.get("/douyinmusic", async (ctx) => {
  console.log("获取抖音music热榜");
  try {
    // 从缓存中获取数据
    let data = await get(cacheKey);
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新获取抖音music热榜");
      // 从服务器拉取数据
      const response = await axios.get(url, { headers: HEADERS, params: QUERIES });
      console.log(response.data);
      data = getData(response.data.music_list);
      updateTime = new Date().toISOString();
      // 将数据写入缓存
      await set(cacheKey, data);
    }
    ctx.body = {
      code: 200,
      message: "获取成功",
      title: "抖音music",
      subtitle: "热榜",
      from,
      total: data.length,
      updateTime,
      data,
    };
  } catch (error) {
    console.error(error);
    ctx.body = {
      code: 500,
      title: "抖音music",
      subtitle: "热榜",
      message: "获取失败",
    };
  }
});

// 抖音music热榜 - 获取最新数据
douyinRouter.get("/douyinmusic/new", async (ctx) => {
  console.log("获取抖音music热榜 - 最新数据");
  try {
    // 从服务器拉取最新数据
    const response = await axios.get(url, { headers: HEADERS, params: QUERIES });
    const newData = getData(response.data.word_list);
    updateTime = new Date().toISOString();
    console.log("从服务端重新获取抖音music热榜");

    // 返回最新数据
    ctx.body = {
      code: 200,
      message: "获取成功",
      title: "抖音music",
      subtitle: "热榜",
      total: newData.length,
      updateTime,
      data: newData,
    };

    // 删除旧数据
    await del(cacheKey);
    // 将最新数据写入缓存
    await set(cacheKey, newData);
  } catch (error) {
    // 如果拉取最新数据失败，尝试从缓存中获取数据
    console.error(error);
    const cachedData = await get(cacheKey);
    if (cachedData) {
      ctx.body = {
        code: 200,
        message: "获取成功",
        title: "抖音music",
        subtitle: "热榜",
        total: cachedData.length,
        updateTime,
        data: cachedData,
      };
    } else {
      // 如果缓存中也没有数据，则返回错误信息
      ctx.body = {
        code: 500,
        title: "抖音music",
        subtitle: "热榜",
        message: "获取失败",
      };
    }
  }
});

module.exports = douyinRouter;
