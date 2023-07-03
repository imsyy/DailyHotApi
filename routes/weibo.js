const Router = require("koa-router");
const weiboRouter = new Router();
const axios = require("axios");
// const cheerio = require("cheerio");
const { get, set, del } = require("../utils/cacheData");

// 接口信息
const routerInfo = {
  title: "微博",
  subtitle: "热搜榜",
};

// 缓存键名
const cacheKey = "weiboData";

// 调用时间
let updateTime = new Date().toISOString();

// 调用路径
const url = "https://weibo.com/ajax/side/hotSearch";

// 数据处理
const getData = (data) => {
  if (!data) return [];
  // return data;
  return data.map((v) => {
    const key = v.word_scheme ? v.word_scheme : `#${v.word}`;
    return {
      title: v.word,
      desc: key,
      hot: v.raw_hot,
      url: `https://s.weibo.com/weibo?q=${encodeURIComponent(
        key
      )}&t=31&band_rank=1&Refer=top`,
      mobileUrl: `https://s.weibo.com/weibo?q=${encodeURIComponent(
        key
      )}&t=31&band_rank=1&Refer=top`,
    };
  });
};

// 微博热搜
weiboRouter.get("/weibo", async (ctx) => {
  console.log("获取微博热搜");
  try {
    // 从缓存中获取数据
    let data = await get(cacheKey);
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新获取微博热搜");
      // 从服务器拉取数据
      const response = await axios.get(url);
      data = getData(response.data.data.realtime);
      updateTime = new Date().toISOString();
      if (!data) {
        ctx.body = {
          code: 500,
          ...routerInfo,
          message: "获取失败",
        };
        return false;
      }
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

// 微博热搜 - 获取最新数据
weiboRouter.get("/weibo/new", async (ctx) => {
  console.log("获取微博热搜 - 最新数据");
  try {
    // 从服务器拉取最新数据
    const response = await axios.get(url);
    const newData = getData(response.data.data.realtime);
    updateTime = new Date().toISOString();
    console.log("从服务端重新获取微博热搜");

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

weiboRouter.info = routerInfo;
module.exports = weiboRouter;
