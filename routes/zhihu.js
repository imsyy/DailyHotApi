const Router = require("koa-router");
const zhihuRouter = new Router();
const axios = require("axios");
const { get, set, del } = require("../utils/cacheData");

// 缓存键名
const cacheKey = "zhihuData";

// 调用时间
let updateTime = new Date().toISOString();

// 调用路径
const url = "https://www.zhihu.com/hot";
const headers = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
};

// 数据处理
const getData = (data) => {
  if (!data) return [];
  const dataList = [];
  try {
    const pattern =
      /<script id="js-initialData" type="text\/json">(.*?)<\/script>/;
    const matchResult = data.match(pattern);
    const jsonObject = JSON.parse(matchResult[1]).initialState.topstory.hotList;
    jsonObject.forEach((v) => {
      dataList.push({
        title: v.target.titleArea.text,
        desc: v.target.excerptArea.text,
        pic: v.target.imageArea.url,
        hot: parseInt(v.target.metricsArea.text.replace(/[^\d]/g, "")) * 10000,
        url: v.target.link.url,
        mobileUrl: v.target.link.url,
      });
    });
    return dataList;
  } catch (error) {
    console.error("数据处理出错" + error);
    return false;
  }
};

// 知乎热榜
zhihuRouter.get("/zhihu", async (ctx) => {
  console.log("获取知乎热榜");
  try {
    // 从缓存中获取数据
    let data = await get(cacheKey);
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新获取知乎热榜");
      // 从服务器拉取数据
      const response = await axios.get(url, { headers });
      data = getData(response.data);
      updateTime = new Date().toISOString();
      if (!data) {
        ctx.body = {
          code: 500,
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
      title: "知乎",
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
      title: "知乎",
      subtitle: "热榜",
      message: "获取失败",
    };
  }
});

// 知乎热榜 - 获取最新数据
zhihuRouter.get("/zhihu/new", async (ctx) => {
  console.log("获取知乎热榜 - 最新数据");
  try {
    // 从服务器拉取最新数据
    const response = await axios.get(url, { headers });
    const newData = getData(response.data);
    updateTime = new Date().toISOString();
    console.log("从服务端重新获取知乎热榜");

    // 返回最新数据
    ctx.body = {
      code: 200,
      message: "获取成功",
      title: "知乎",
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
        title: "知乎",
        subtitle: "热榜",
        total: cachedData.length,
        updateTime,
        data: cachedData,
      };
    } else {
      // 如果缓存中也没有数据，则返回错误信息
      ctx.body = {
        code: 500,
        title: "知乎",
        subtitle: "热榜",
        message: "获取失败",
      };
    }
  }
});

module.exports = zhihuRouter;
