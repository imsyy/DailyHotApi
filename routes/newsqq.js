const Router = require("koa-router");
const newsqqRouter = new Router();
const axios = require("axios");
const { get, set, del } = require("../utils/cacheData");

// 接口信息
const routerInfo = {
  name: "newsqq",
  title: "腾讯新闻",
  subtitle: "热点",
};

// 缓存键名
const cacheKey = "newsqqData";

// 调用时间
let updateTime = new Date().toISOString();

// 调用路径
const url = "https://r.inews.qq.com/gw/event/hot_ranking_list?page_size=50";

// 数据处理
const getData = (data) => {
  if (!data) return [];
  return data.slice(1).map((v) => {
    return {
      id: v.id,
      title: v.title,
      desc: v.abstract,
      descSm: v.nlpAbstract,
      hot: v.readCount,
      pic: v.miniProShareImage,
      url: `https://new.qq.com/rain/a/${v.id}`,
      mobileUrl: `https://view.inews.qq.com/a/${v.id}`,
    };
  });
};

// 腾讯热点榜
newsqqRouter.get("/newsqq", async (ctx) => {
  console.log("获取腾讯热点榜");
  try {
    // 从缓存中获取数据
    let data = await get(cacheKey);
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新获取腾讯热点榜");
      // 从服务器拉取数据
      const response = await axios.get(url);
      data = getData(response.data.idlist[0].newslist);
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

// 腾讯热点榜 - 获取最新数据
newsqqRouter.get("/newsqq/new", async (ctx) => {
  console.log("获取腾讯热点榜 - 最新数据");
  try {
    // 从服务器拉取最新数据
    const response = await axios.get(url);
    const newData = getData(response.data.idlist[0].newslist);
    updateTime = new Date().toISOString();
    console.log("从服务端重新获取腾讯热点榜");

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

newsqqRouter.info = routerInfo;
module.exports = newsqqRouter;
