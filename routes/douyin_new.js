/*
 * @version: 1.0.0
 * @author: WangPeng
 * @date: 2023-07-10 16:56:01
 * @customEditors: imsyy
 * @lastEditTime: 2023-07-11 16:54:38
 */

const Router = require("koa-router");
const douyinNewRouter = new Router();
const axios = require("axios");
const { get, set, del } = require("../utils/cacheData");

// 接口信息
const routerInfo = {
  title: "抖音",
  subtitle: "热点榜",
};

// 缓存键名
const cacheKey = "douyinHotNewData";

// 调用时间
let updateTime = new Date().toISOString();

// 调用路径
const url = "https://aweme.snssdk.com/aweme/v1/hot/search/list/";
const HEADERS = {
  "user-agent": "okhttp3",
};
const QUERIES = {
  device_platform: "android",
  version_name: "13.2.0",
  version_code: "130200",
  aid: "1128",
};

// 数据处理
const getData = (data) => {
  if (!data) return [];
  try {
    const jsonObject = data.data.word_list;
    return jsonObject.map((v) => {
      return {
        title: v.word,
        pic: `${v.word_cover.url_list[0]}`,
        hot: Number(v.hot_value),
        url: `https://www.douyin.com/hot/${encodeURIComponent(v.sentence_id)}`,
        mobileUrl: `https://www.douyin.com/hot/${encodeURIComponent(
          v.sentence_id
        )}`,
      };
    });
  } catch (error) {
    console.error("数据处理出错" + error);
    return [];
  }
};

// 抖音热点榜
douyinNewRouter.get("/douyin_new", async (ctx) => {
  console.log("获取抖音热点榜");
  try {
    // 从缓存中获取数据
    let data = await get(cacheKey);
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新获取抖音热点榜");
      // 从服务器拉取数据
      const response = await axios.get(url, {
        headers: HEADERS,
        params: QUERIES,
      });
      data = getData(response.data);
      updateTime = new Date().toISOString();
      // 将数据写入缓存
      await set(cacheKey, data);
    }
    ctx.body = {
      code: 200,
      message: "获取成功",
      ...routerInfo,
      from,
      total: data.length,
      updateTime,
      data,
    };
  } catch (error) {
    console.error(error);
    ctx.body = {
      code: 500,
      ...routerInfo,
      message: "获取失败",
    };
  }
});

// 抖音热点榜 - 获取最新数据
douyinNewRouter.get("/douyin_new/new", async (ctx) => {
  console.log("获取抖音热点榜 - 最新数据");
  try {
    // 从服务器拉取最新数据
    const response = await axios.get(url, {
      headers: HEADERS,
      params: QUERIES,
    });
    const newData = getData(response.data);
    updateTime = new Date().toISOString();
    console.log("从服务端重新获取抖音热点榜");

    // 返回最新数据
    ctx.body = {
      code: 200,
      message: "获取成功",
      ...routerInfo,
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
        ...routerInfo,
        total: cachedData.length,
        updateTime,
        data: cachedData,
      };
    } else {
      // 如果缓存中也没有数据，则返回错误信息
      ctx.body = {
        code: 500,
        ...routerInfo,
        message: "获取失败",
      };
    }
  }
});

douyinNewRouter.info = routerInfo;
module.exports = douyinNewRouter;
