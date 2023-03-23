const Router = require("koa-router");
const baiduRouter = new Router();
const axios = require("axios");
const { get, set, del } = require("../utils/cacheData");

// 缓存键名
const cacheKey = "baiduData";

// 调用时间
let updateTime = new Date().toISOString();

// 调用路径
const url = "https://top.baidu.com/board?tab=realtime";

// 数据处理
const getData = (data) => {
  if (!data) return [];
  const dataList = [];
  try {
    const pattern = /<\!--s-data:(.*?)-->/s;
    const matchResult = data.match(pattern);
    const jsonObject = JSON.parse(matchResult[1]).cards[0].content;
    jsonObject.forEach((v) => {
      dataList.push({
        title: v.query,
        desc: v.desc,
        pic: v.img,
        hot: Number(v.hotScore),
        url: `https://www.baidu.com/s?wd=${encodeURIComponent(v.query)}`,
        mobileUrl: v.url,
      });
    });
    return dataList;
  } catch (error) {
    console.error("数据处理出错" + error);
    return false;
  }
};

// 百度热搜
baiduRouter.get("/baidu", async (ctx) => {
  console.log("获取百度热搜");
  try {
    // 从缓存中获取数据
    let data = await get(cacheKey);
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新获取百度热搜");
      // 从服务器拉取数据
      const response = await axios.get(url);
      data = getData(response.data);
      updateTime = new Date().toISOString();
      if (!data) {
        ctx.body = {
          code: 500,
          title: "百度",
          subtitle: "热搜榜",
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
      title: "百度",
      subtitle: "热搜榜",
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

// 百度热搜 - 获取最新数据
baiduRouter.get("/baidu/new", async (ctx) => {
  console.log("获取百度热搜 - 最新数据");
  try {
    // 从服务器拉取最新数据
    const response = await axios.get(url);
    const newData = getData(response.data);
    updateTime = new Date().toISOString();
    console.log("从服务端重新获取百度热搜");

    // 返回最新数据
    ctx.body = {
      code: 200,
      message: "获取成功",
      title: "百度",
      subtitle: "热搜榜",
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
        title: "百度",
        subtitle: "热搜榜",
        total: cachedData.length,
        updateTime,
        data: cachedData,
      };
    } else {
      // 如果缓存中也没有数据，则返回错误信息
      ctx.body = {
        code: 500,
        title: "百度",
        subtitle: "热搜榜",
        message: "获取失败",
      };
    }
  }
});

module.exports = baiduRouter;
