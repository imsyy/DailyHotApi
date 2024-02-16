/**
 * @author: x-dr
 * @date: 2023-12-27
 * @customEditors: imsyy
 * @lastEditTime: 2024-01-02
 */

const URL = require("url");
const Router = require("koa-router");
const neteaseMusicRouter = new Router();
const axios = require("axios");
const cheerio = require("cheerio");
const { get, set, del } = require("../utils/cacheData");

// 接口信息
const routerInfo = {
  name: "netease_music_toplist",
  title: "网易云音乐",
  subtitle: "排行榜",
};

// 缓存键名
const cacheKey = "neteasemusicToplistData";

// 调用时间
let updateTime = new Date().toISOString();

// 调用路径
const url = "https://music.163.com/discover/toplist?id=";
const headers = {
  authority: "music.163.com",
  referer: "https://music.163.com/",
};

// 榜单类别
const listType = {
  1: {
    id: 19723756,
    name: "飙升榜",
  },
  2: {
    id: 3779629,
    name: "新歌榜",
  },
  3: {
    id: 2884035,
    name: "原创榜",
  },
  4: {
    id: 3778678,
    name: "热歌榜",
  },
};

// 数据处理
const getData = (data) => {
  if (!data) return false;
  const dataList = [];
  const $ = cheerio.load(data);
  try {
    $(".m-sgitem").each((i, e) => {
      const urlString = $(e).attr("href");
      const parsedUrl = URL.parse(urlString, true);
      const urlidValue = parsedUrl.query.id;
      const item = cheerio.load($(e).html());
      const author = item('div[class="f-thide sginfo"]')
        .text()
        .replace(/(^\s*)|(\s*$)/g, "");
      const title = item('div[class="f-thide sgtl"]')
        .text()
        .replace(/(^\s*)|(\s*$)/g, "");
      dataList.push({
        title: title,
        desc: author,
        url: `https://music.163.com/#/song?id=${urlidValue}`,
        mobileUrl: `https://music.163.com/m/song?id=${urlidValue}`,
      });
    });
    return dataList;
  } catch (error) {
    console.error("数据处理出错" + error);
    return false;
  }
};

// 网易云音乐排行榜
neteaseMusicRouter.get("/netease_music_toplist", async (ctx) => {
  console.log("获取网易云音乐排行榜");
  try {
    // 获取参数
    const { type } = ctx.query;
    const typeNum = Number(type);
    if (!typeNum || typeNum > 4 || typeNum < 1) {
      ctx.body = { code: 400, ...routerInfo, message: "参数不完整或不正确" };
      return false;
    }
    // 更改名称
    routerInfo.subtitle = listType[typeNum].name;
    // 从缓存中获取数据
    let data = await get(cacheKey + listType[typeNum].id);
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新获取网易云音乐排行榜");
      // 从服务器拉取数据
      const response = await axios.get(url + listType[typeNum].id, { headers });
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
      await set(cacheKey + listType[typeNum].id, data);
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

// 网易云音乐排行榜 - 获取最新数据
neteaseMusicRouter.get("/netease_music_toplist/new", async (ctx) => {
  console.log("获取网易云音乐排行榜 - 最新数据");
  try {
    // 获取参数
    const { type } = ctx.query;
    const typeNum = Number(type);
    if (!typeNum || typeNum > 4 || typeNum < 1) {
      ctx.body = { code: 400, ...routerInfo, message: "参数不完整或不正确" };
      return false;
    }
    // 更改名称
    routerInfo.subtitle = listType[typeNum].name;
    // 从服务器拉取最新数据
    const response = await axios.get(url + listType[typeNum].id, { headers });
    const newData = getData(response.data);
    updateTime = new Date().toISOString();
    console.log("从服务端重新获取网易云音乐排行榜");

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
    await del(cacheKey + listType[typeNum].id);
    // 将最新数据写入缓存
    await set(cacheKey + listType[typeNum].id, newData);
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

neteaseMusicRouter.info = routerInfo;
module.exports = neteaseMusicRouter;
