const Router = require("koa-router");
const lolRouter = new Router();
const axios = require("axios");
const { get, set, del } = require("../utils/cacheData");

// 接口信息
const routerInfo = {
  name: "lol",
  title: "英雄联盟",
  subtitle: "更新公告",
};

// 缓存键名
const cacheKey = "lolData";

// 调用时间
let updateTime = new Date().toISOString();

// 调用路径
const url =
  "https://apps.game.qq.com/cmc/zmMcnTargetContentList?r0=jsonp&page=1&num=16&target=24&source=web_pc";

// 数据处理
const getData = (data) => {
  if (!data) return [];
  const dataList = [];
  try {
    const match = data.match(/callback\((.*)\)/);
    const jsonObject = JSON.parse(match[1]).data.result;
    jsonObject.forEach((v) => {
      dataList.push({
        title: v.sTitle,
        desc: v.sAuthor,
        pic: `https:${v.sIMG}`,
        hot: Number(v.iTotalPlay),
        url: `https://lol.qq.com/news/detail.shtml?docid=${encodeURIComponent(v.iDocID)}`,
        mobileUrl: `https://lol.qq.com/news/detail.shtml?docid=${encodeURIComponent(v.iDocID)}`,
      });
    });
    return dataList;
  } catch (error) {
    console.error("数据处理出错" + error);
    return false;
  }
};

// 英雄联盟更新公告
lolRouter.get("/lol", async (ctx) => {
  console.log("获取英雄联盟更新公告");
  try {
    // 从缓存中获取数据
    let data = await get(cacheKey);
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新获取英雄联盟更新公告");
      // 从服务器拉取数据
      const response = await axios.get(url);
      data = getData(response.data);
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
      message: "获取失败",
    };
  }
});

// 英雄联盟更新公告 - 获取最新数据
lolRouter.get("/lol/new", async (ctx) => {
  console.log("获取英雄联盟更新公告 - 最新数据");
  try {
    // 从服务器拉取最新数据
    const response = await axios.get(url);
    const newData = getData(response.data);
    updateTime = new Date().toISOString();
    console.log("从服务端重新获取英雄联盟更新公告");

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

lolRouter.info = routerInfo;
module.exports = lolRouter;
