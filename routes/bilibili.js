const Router = require("koa-router");
const bilibiliRouter = new Router();
const axios = require("axios");
const { get, set, del } = require("../utils/cacheData");

// 缓存键名
const cacheKey = "bilibiliData";

// 调用时间
let updateTime = new Date().toISOString();

// 调用路径
const url = "https://api.bilibili.com/x/web-interface/ranking/v2";

// 数据处理
const getData = (data) => {
  if (!data) return [];
  return data.map((v) => {
    return {
      id: v.bvid,
      title: v.title,
      desc: v.desc,
      pic: v.pic.replace(/http:/, "https:"),
      owner: v.owner,
      data: v.stat,
      hot: v.stat.view,
      url: v.short_link,
      mobileUrl: `https://m.bilibili.com/video/${v.bvid}`,
    };
  });
};

// 哔哩哔哩热门榜
bilibiliRouter.get("/bilibili", async (ctx) => {
  console.log("获取哔哩哔哩热门榜");
  try {
    // 从缓存中获取数据
    let data = await get(cacheKey);
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新获取哔哩哔哩热门榜");
      // 从服务器拉取数据
      const response = await axios.get(url);
      data = getData(response.data.data.list);
      updateTime = new Date().toISOString();
      // 将数据写入缓存
      await set(cacheKey, data);
    }
    ctx.body = {
      code: 200,
      message: "获取成功",
      title: "哔哩哔哩",
      subtitle: "热门榜",
      from,
      total: data.length,
      updateTime,
      data,
    };
  } catch (error) {
    console.error(error);
    ctx.body = {
      code: 500,
      title: "哔哩哔哩",
      subtitle: "热门榜",
      message: "哔哩哔哩热门榜获取失败",
    };
  }
});

// 哔哩哔哩热门榜 - 获取最新数据
bilibiliRouter.get("/bilibili/new", async (ctx) => {
  console.log("获取哔哩哔哩热门榜 - 最新数据");
  try {
    // 从服务器拉取最新数据
    const response = await axios.get(url);
    const newData = getData(response.data.data.list);
    updateTime = new Date().toISOString();
    console.log("从服务端重新获取哔哩哔哩热门榜");

    // 返回最新数据
    ctx.body = {
      code: 200,
      message: "获取成功",
      title: "哔哩哔哩",
      subtitle: "热门榜",
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
        title: "哔哩哔哩",
        subtitle: "热门榜",
        total: cachedData.length,
        updateTime,
        data: cachedData,
      };
    } else {
      // 如果缓存中也没有数据，则返回错误信息
      ctx.body = {
        code: 500,
        title: "哔哩哔哩",
        subtitle: "热门榜",
        message: "获取失败",
      };
    }
  }
});

module.exports = bilibiliRouter;
