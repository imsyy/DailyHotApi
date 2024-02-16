/*
 * @author: x-dr
 * @date: 2023-12-25
 * @customEditors: imsyy
 * @lastEditTime: 2023-12-27
 */

const Router = require("koa-router");
const githubNewRouter = new Router();
const axios = require("axios");
const cheerio = require("cheerio");
const { get, set, del } = require("../utils/cacheData");

// 接口信息
const routerInfo = {
  name: "github",
  title: "Github",
  subtitle: "Trending",
};

// 缓存键名
const cacheKey = "githubData";

// 调用时间
let updateTime = new Date().toISOString();

const url = "https://github.com/trending";
const headers = {
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
};

// 数据处理
const getData = (data) => {
  if (!data) return false;
  const dataList = [];
  const $ = cheerio.load(data);
  try {
    $(`.Box-row`).each((i, e) => {
      // console.log(getCheerio(e).html());
      const item = cheerio.load($(e).html());
      // console.log(item);
      const title = item("h2 a").attr("href").replace("/", "");
      const url = `https://github.com/${title}`;
      const excerpt = item("p")
        .text()
        .replace(/(^\s*)|(\s*$)/g, "");
      const language = item('.f6 span[itemprop="programmingLanguage"]')
        .text()
        .replace(/(^\s*)|(\s*$)/g, "");
      const stars = item(".f6 a:first")
        .text()
        .replace(/(^\s*)|(\s*$)/g, "");
      const forks = item(".f6 a:eq(1)")
        .text()
        .replace(/(^\s*)|(\s*$)/g, "");
      const starstoday = item(".f6 span:eq(4)")
        .text()
        .replace(/(^\s*)|(\s*$)/g, "");

      dataList.push({
        title: title,
        desc: excerpt,
        url: url,
        language: language,
        stars: stars,
        forks: forks,
        starstoday: starstoday,
      });
    });
    return dataList;
  } catch (error) {
    console.error("数据处理出错" + error);
    return false;
  }
};

// trending
githubNewRouter.get("/github", async (ctx) => {
  console.log("获取github trending");
  try {
    // 从缓存中获取数据
    let data = await get(cacheKey);
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新github trending");
      // 从服务器拉取数据
      const response = await axios.get(url, { headers });
      // console.log(response.data);
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
      ...routerInfo,
      message: "获取失败",
    };
  }
});

// trending - 获取最新数据
githubNewRouter.get("/github/new", async (ctx) => {
  console.log("获取github trending  - 最新数据");
  try {
    // 从服务器拉取最新数据
    const response = await axios.get(url, { headers });
    const newData = getData(response.data);
    updateTime = new Date().toISOString();
    console.log("从服务端重新github trending");

    // 返回最新数据
    ctx.body = {
      code: 200,
      message: "获取成功",
      ...routerInfo,
      updateTime,
      total: newData.length,
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

githubNewRouter.info = routerInfo;
module.exports = githubNewRouter;
