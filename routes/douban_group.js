/**
 * @author: x-dr
 * @date: 2023-12-26
 * @customEditors: imsyy
 * @lastEditTime: 2024-01-02
 */

const Router = require("koa-router");
const doubanGroupNewRouter = new Router();
const axios = require("axios");
const cheerio = require("cheerio");
const { get, set, del } = require("../utils/cacheData");

// 接口信息
const routerInfo = {
  name: "douban_group",
  title: "豆瓣讨论小组",
  subtitle: "精选",
};

// 缓存键名
const cacheKey = "doubanGroupData";

// 调用时间
let updateTime = new Date().toISOString();

// 调用路径
const url = "https://www.douban.com/group/explore";

const headers = {
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
  "cache-control": "max-age=0",
  "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "none",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
  // "cookie": "bid=lLpb6D1JLuw; douban-fav-remind=1; _pk_id.100001.8cb4=e7d91ae46530fd1d.1680518589.; ll=\"118281\"; _pk_ref.100001.8cb4=%5B%22%22%2C%22%22%2C1703602972%2C%22http%3A%2F%2Fnew.xianbao.fun%2F%22%5D; _pk_ses.100001.8cb4=1; ap_v=0,6.0"
};

// 数据处理
const getData = (data) => {
  if (!data) return false;
  const dataList = [];
  const $ = cheerio.load(data);
  try {
    $(`.channel-item`).each((i, e) => {
      // console.log($(e).html());
      const item = cheerio.load($(e).html());
      const title = item("h3")
        .text()
        .replace(/(^\s*)|(\s*$)/g, "");
      const url = item("h3 a").attr("href");
      const hot = item('div[class="likes"]')
        .text()
        .replace(/(^\s*)|(\s*$)/g, "");
      const desc = item('div[class="block"]')
        .text()
        .replace(/(^\s*)|(\s*$|\n)/g, "");
      const source = item('div[class="source"] a')
        .text()
        .replace(/(^\s*)|(\s*$)/g, "");
      // const excerpt = item('.channel-item-desc').text().replace(/(^\s*)|(\s*$)/g, "")
      // console.log(title);
      // console.log(url);
      dataList.push({
        title: title,
        desc: desc,
        url: url,
        mobileUrl: url,
        hot: hot,
        source: source,
      });
    });
    return dataList;
  } catch (error) {
    console.error("数据处理出错" + error);
    return false;
  }
};

// trending
doubanGroupNewRouter.get("/douban_group", async (ctx) => {
  console.log("获取豆瓣讨论小组精选");
  try {
    // 从缓存中获取数据
    let data = await get(cacheKey);
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新豆瓣讨论小组精选");
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

// 豆瓣新片榜 - 获取最新数据
doubanGroupNewRouter.get("/douban_group/new", async (ctx) => {
  console.log("获取豆瓣讨论小组精选  - 最新数据");
  try {
    // 从服务器拉取最新数据
    const response = await axios.get(url, { headers });
    const newData = getData(response.data);
    updateTime = new Date().toISOString();
    console.log("从服务端重新豆瓣讨论小组精选");

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

doubanGroupNewRouter.info = routerInfo;
module.exports = doubanGroupNewRouter;
