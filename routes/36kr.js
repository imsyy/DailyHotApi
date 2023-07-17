const Router = require("koa-router");
const krRouter = new Router();
const axios = require("axios");
const { get, set, del } = require("../utils/cacheData");

// 接口信息
const routerInfo = {
  name: "36kr",
  title: "36氪",
  subtitle: "热榜",
};

// 缓存键名
const cacheKey = "krData";

// 调用时间
let updateTime = new Date().toISOString();

// 调用路径
const url = "https://gateway.36kr.com/api/mis/nav/home/nav/rank/hot";

// 数据处理
const getData = (data) => {
  if (!data) return [];
  return data.map((v) => {
    return {
      id: v.itemId,
      title: v.templateMaterial.widgetTitle,
      pic: v.templateMaterial.widgetImage,
      owner: v.templateMaterial.authorName,
      hot: v.templateMaterial.statRead,
      data: v.templateMaterial,
      url: `https://www.36kr.com/p/${v.itemId}`,
      mobileUrl: `https://www.36kr.com/p/${v.itemId}`,
    };
  });
};

// 36氪热榜
krRouter.get("/36kr", async (ctx) => {
  console.log("获取36氪热榜");
  try {
    // 从缓存中获取数据
    let data = await get(cacheKey);
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新获取36氪热榜");
      // 从服务器拉取数据
      const response = await axios.post(url, {
        partner_id: "wap",
        param: {
          siteId: 1,
          platformId: 2,
        },
        timestamp: new Date().getTime(),
      });
      data = getData(response.data.data.hotRankList);
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

// 36氪热榜 - 获取最新数据
krRouter.get("/36kr/new", async (ctx) => {
  console.log("获取36氪热榜 - 最新数据");
  try {
    // 从服务器拉取最新数据
    const response = await axios.post(url, {
      partner_id: "wap",
      param: {
        siteId: 1,
        platformId: 2,
      },
      timestamp: new Date().getTime(),
    });
    const newData = getData(response.data.data.hotRankList);
    updateTime = new Date().toISOString();
    console.log("从服务端重新获取36氪热榜");

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

krRouter.info = routerInfo;
module.exports = krRouter;
