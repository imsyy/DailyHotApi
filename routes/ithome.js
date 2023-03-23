const Router = require("koa-router");
const itHomeRouter = new Router();
const axios = require("axios");
const cheerio = require("cheerio");
const { get, set, del } = require("../utils/cacheData");

// 缓存键名
const cacheKey = "itHomeData";

// 调用时间
let updateTime = new Date().toISOString();

// 调用路径
const url = "https://m.ithome.com/rankm/";
const headers = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
};

// it之家特殊处理 - url
const replaceLink = (url) => {
  const match = url.match(/html\/(\d+)\.htm/)[1];
  return `https://www.ithome.com/0/${match.slice(0, 3)}/${match.slice(3)}.htm`;
};

// 数据处理
const getData = (data) => {
  if (!data) return false;
  const dataList = [];
  const $ = cheerio.load(data);
  try {
    $(".rank-name").each(function () {
      const type = $(this).data("rank-type");
      const newListHtml = $(this).next(".rank-box").html();
      cheerio
        .load(newListHtml)(".placeholder")
        .get()
        .map((v) => {
          console.log($(v));
          dataList.push({
            title: $(v).find(".plc-title").text(),
            img: $(v).find("img").attr("data-original"),
            time: $(v).find(".post-time").text(),
            type: $(this).text(),
            typeName: type,
            hot: Number($(v).find(".review-num").text().replace(/\D/g, "")),
            url: replaceLink($(v).find("a").attr("href")),
            mobileUrl: $(v).find("a").attr("href"),
          });
        });
      // dataList[type] = {
      //   name: $(this).text(),
      //   total: newsList.length,
      //   list: newsList,
      // };
    });
    return dataList;
  } catch (error) {
    console.error("数据处理出错" + error);
    return false;
  }
};

// IT之家热榜
itHomeRouter.get("/ithome", async (ctx) => {
  console.log("获取IT之家热榜");
  try {
    // 从缓存中获取数据
    let data = await get(cacheKey);
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新获取IT之家热榜");
      // 从服务器拉取数据
      const response = await axios.get(url, { headers });
      data = getData(response.data);
      updateTime = new Date().toISOString();
      if (!data) {
        ctx.body = {
          code: 500,
          title: "IT之家",
          subtitle: "热榜",
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
      title: "IT之家",
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
      title: "IT之家",
      subtitle: "热榜",
      message: "获取失败",
    };
  }
});

// IT之家热榜 - 获取最新数据
itHomeRouter.get("/ithome/new", async (ctx) => {
  console.log("获取IT之家热榜 - 最新数据");
  try {
    // 从服务器拉取最新数据
    const response = await axios.get(url, { headers });
    const newData = getData(response.data);
    updateTime = new Date().toISOString();
    console.log("从服务端重新获取IT之家热榜");

    // 返回最新数据
    ctx.body = {
      code: 200,
      message: "获取成功",
      title: "IT之家",
      subtitle: "热榜",
      updateTime,
      total: data.length,
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
        title: "IT之家",
        subtitle: "热榜",
        total: data.length,
        updateTime,
        data: cachedData,
      };
    } else {
      // 如果缓存中也没有数据，则返回错误信息
      ctx.body = {
        code: 500,
        title: "IT之家",
        subtitle: "热榜",
        message: "获取失败",
      };
    }
  }
});

module.exports = itHomeRouter;
