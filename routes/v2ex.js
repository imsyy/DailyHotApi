/**
 *  @author: x-dr
 *  @date: 2023-12-25
 * @customEditors: imsyy
 * @lastEditTime: 2024-01-02
 */

const Router = require("koa-router");
const v2exRouter = new Router();
const axios = require("axios");
const cheerio = require("cheerio");
const { get, set, del } = require("../utils/cacheData");

// 接口信息
const routerInfo = {
  name: "v2ex",
  title: "V2EX",
  subtitle: "热帖",
};

// 缓存键名
const cacheKey = "v2exData";

// 调用时间
let updateTime = new Date().toISOString();

// 调用路径
const url = "https://www.v2ex.com/?tab=hot";
const headers = {
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
  authority: "www.v2ex.com",
  referer: "https://www.v2ex.com/",
};

// 数据处理
const getData = (data) => {
  if (!data) return false;
  const dataList = [];
  const $ = cheerio.load(data);
  try {
    $(`div[class="cell item"]`).each((i, e) => {
      const item = cheerio.load($(e).html());
      const title = item('span[class="item_title"]')
        .text()
        .replace(/(^\s*)|(\s*$)/g, "");
      const href = item(".item_title a").attr("href");
      const url = `https://www.v2ex.com${href}`;
      const comments = item(".count_livid")
        .text()
        .replace(/(^\s*)|(\s*$)/g, "");
      const member = item(".topic_info strong a:first")
        .text()
        .replace(/(^\s*)|(\s*$)/g, "");
      const node = item(".topic_info .node")
        .text()
        .replace(/(^\s*)|(\s*$)/g, "");
      const avatar_img = item(".avatar").attr("src");
      // console.log( url);

      dataList.push({
        title: title,
        url: url,
        mobileUrl: url,
        comments: comments,
        member: member,
        node: node,
        avatar: avatar_img,
      });
    });

    return dataList;
  } catch (error) {
    console.error("数据处理出错" + error);
    return false;
  }
};

// v2ex
v2exRouter.get("/v2ex", async (ctx) => {
  console.log("获取v2ex");
  try {
    // 从缓存中获取数据
    let data = await get(cacheKey);
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新获取v2ex");
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

// v2ex - 获取最新数据
v2exRouter.get("/v2ex/new", async (ctx) => {
  console.log("获取v2ex  - 最新数据");
  try {
    // 从服务器拉取最新数据
    const response = await axios.get(url, { headers });
    const newData = getData(response.data);
    updateTime = new Date().toISOString();
    console.log("从服务端重新获取v2ex");

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

v2exRouter.info = routerInfo;
module.exports = v2exRouter;
