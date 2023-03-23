const Router = require("koa-router");
const toutiaoRouter = new Router();
const axios = require("axios");
const { get, set, del } = require("../utils/cacheData");

// 缓存键名
const cacheKey = "toutiaoData";

// 调用时间
let updateTime = new Date().toISOString();

// 调用路径
const url = "https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc";

// 数据处理
const getData = (data) => {
  if (!data) return [];
  return data.map((v) => {
    return {
      id: v.ClusterId,
      title: v.Title,
      pic: v.Image.url,
      hot: v.HotValue,
      url: `https://www.toutiao.com/trending/${v.ClusterIdStr}/`,
      mobileUrl: `https://api.toutiaoapi.com/feoffline/amos_land/new/html/main/index.html?topic_id=${v.ClusterIdStr}`,
    };
  });
};

// 头条热榜
toutiaoRouter.get("/toutiao", async (ctx) => {
  console.log("获取头条热榜");
  try {
    // 从缓存中获取数据
    let data = await get(cacheKey);
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新获取头条热榜");
      // 从服务器拉取数据
      const response = await axios.get(url);
      data = getData(response.data.data);
      updateTime = new Date().toISOString();
      // 将数据写入缓存
      await set(cacheKey, data);
    }
    ctx.body = {
      code: 200,
      message: "获取成功",
      title: "今日头条",
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
      title: "今日头条",
      subtitle: "热榜",
      message: "获取失败",
    };
  }
});

// 头条热榜 - 获取最新数据
toutiaoRouter.get("/toutiao/new", async (ctx) => {
  console.log("获取头条热榜 - 最新数据");
  try {
    // 从服务器拉取最新数据
    const response = await axios.get(url);
    const newData = getData(response.data.data);
    updateTime = new Date().toISOString();
    console.log("从服务端重新获取头条热榜");

    // 返回最新数据
    ctx.body = {
      code: 200,
      message: "获取成功",
      title: "今日头条",
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
        title: "今日头条",
        subtitle: "热榜",
        total: cachedData.length,
        updateTime,
        data: cachedData,
      };
    } else {
      // 如果缓存中也没有数据，则返回错误信息
      ctx.body = {
        code: 500,
        title: "今日头条",
        subtitle: "热榜",
        message: "获取失败",
      };
    }
  }
});

module.exports = toutiaoRouter;
