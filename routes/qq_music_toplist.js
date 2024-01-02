/**
 * @author: x-dr
 * @date: 2023-12-27
 * @customEditors: imsyy
 * @lastEditTime: 2024-01-02
 */

// const fs = require("fs");
const Router = require("koa-router");
const qqMusicRouter = new Router();
const axios = require("axios");
const cheerio = require("cheerio");
const { get, set, del } = require("../utils/cacheData");

// 接口信息
const routerInfo = {
  name: "qq_music_toplist",
  title: "QQ音乐",
  subtitle: "排行榜",
};

// 缓存键名
const cacheKey = "qqmusicData";

// 调用时间
let updateTime = new Date().toISOString();

const url = "https://y.qq.com/n/ryqq/toplist/";

const headers = {
  authority: "y.qq.com",
  referer: "https://www.google.com/",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

// 榜单类别
const listType = {
  1: {
    id: 62,
    name: "飙升榜",
  },
  2: {
    id: 26,
    name: "热歌榜",
  },
  3: {
    id: 27,
    name: "新歌榜",
  },
  4: {
    id: 4,
    name: "流行指数榜",
  },
  5: {
    id: 52,
    name: "腾讯音乐人原创榜",
  },
  6: {
    id: 67,
    name: "听歌识曲榜",
  },
};

// 数据处理
const getData = (data) => {
  if (!data) return false;
  const dataList = [];
  const $ = cheerio.load(data);
  // fs.writeFileSync('qq.html', $.html());
  try {
    $(".songlist__item").each((i, e) => {
      const item = cheerio.load($(e).html());
      const title = item('a[class="songlist__cover"]').attr("title");
      const urlPath = item('a[class="songlist__cover"]').attr("href");
      const author = item('div[class="songlist__artist"]')
        .text()
        .replace(/(^\s*)|(\s*$)/g, "");
      const songtime = item('div[class="songlist__time"]')
        .text()
        .replace(/(^\s*)|(\s*$)/g, "");
      // const title = item('div[class="f-thide sgtl"]').text().replace(/(^\s*)|(\s*$)/g, "")
      dataList.push({
        title: title,
        desc: author,
        songtime: songtime,
        url: `https://y.qq.com${urlPath}`,
        mobileUrl: `https://y.qq.com${urlPath}`,
      });
    });
    return dataList;
  } catch (error) {
    console.error("数据处理出错" + error);
    return false;
  }
};

// 获取QQ音乐排行榜
qqMusicRouter.get("/qq_music_toplist", async (ctx) => {
  console.log("获取QQ音乐排行榜");
  try {
    // 获取参数
    const { type } = ctx.query;
    const typeNum = Number(type);
    if (!typeNum || typeNum > 6 || typeNum < 1) {
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
      console.log("从服务端重新QQ音乐排行榜");
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

// 获取QQ音乐排行榜 - 获取最新数据
qqMusicRouter.get("/qq_music_toplist/new", async (ctx) => {
  console.log("获取QQ音乐排行榜  - 最新数据");
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
    console.log("从服务端重新QQ音乐排行榜");

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

qqMusicRouter.info = routerInfo;
module.exports = qqMusicRouter;
