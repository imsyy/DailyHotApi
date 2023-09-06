const Router = require("koa-router");
const doubanNewRouter = new Router();
const axios = require("axios");
const cheerio = require("cheerio");
const { get, set, del } = require("../utils/cacheData");

// 接口信息
const routerInfo = {
  name: "douban",
  title: "豆瓣",
  subtitle: "新片榜"
};

// 缓存键名
const cacheKey = "doubanNewData";

// 调用时间
let updateTime = new Date().toISOString();

// 调用路径
const url = "https://movie.douban.com/chart/";
const headers = {
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
};

// 豆瓣新片榜单特殊处理 - 标题
const replaceTitle = (title, score) => {
  return `[★${score}] ` + title.replace(/\n/g, "").replace(/ /g, "").replace(/\//g, " / ").trim();
};

// 数据处理
const getData = (data) => {
  if (!data) return false;
  const dataList = [];
  const $ = cheerio.load(data);
  try {
    $(".article .item").map((idx, item) => {
      const id = $(item).find("a").attr("href").split("/").at(-2) ?? "";
      const score = $(item).find(".rating_nums").text() ?? "";

      dataList.push({
        title: replaceTitle($(item).find("a").text(), score),
        desc: $(item).find("p").text(),
        score,
        comments: $(item).find("span.pl").text().match(/\d+/)[0] ?? "",
        pic: $(item).find("img").attr("src") ?? "",
        url: $(item).find("a").attr("href") ?? "",
        mobileUrl: `https://m.douban.com/movie/subject/${id}`
      });
    });
    return dataList;
  } catch (error) {
    console.error("数据处理出错" + error);
    return false;
  }
};

// 豆瓣新片榜
doubanNewRouter.get("/douban_new", async (ctx) => {
  console.log("获取豆瓣新片榜");
  try {
    // 从缓存中获取数据
    let data = await get(cacheKey);
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新获取豆瓣新片榜");
      // 从服务器拉取数据
      const response = await axios.get(url, { headers });
      data = getData(response.data);
      updateTime = new Date().toISOString();
      if (!data) {
        ctx.body = {
          code: 500,
          ...routerInfo,
          message: "获取失败"
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
      data
    };
  } catch (error) {
    console.error(error);
    ctx.body = {
      code: 500,
      ...routerInfo,
      message: "获取失败"
    };
  }
});

// 豆瓣新片榜 - 获取最新数据
doubanNewRouter.get("/douban_new/new", async (ctx) => {
  console.log("获取豆瓣新片榜 - 最新数据");
  try {
    // 从服务器拉取最新数据
    const response = await axios.get(url, { headers });
    const newData = getData(response.data);
    updateTime = new Date().toISOString();
    console.log("从服务端重新获取豆瓣新片榜");

    // 返回最新数据
    ctx.body = {
      code: 200,
      message: "获取成功",
      ...routerInfo,
      updateTime,
      total: newData.length,
      data: newData
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
        data: cachedData
      };
    } else {
      // 如果缓存中也没有数据，则返回错误信息
      ctx.body = {
        code: 500,
        ...routerInfo,
        message: "获取失败"
      };
    }
  }
});

doubanNewRouter.info = routerInfo;
module.exports = doubanNewRouter;
