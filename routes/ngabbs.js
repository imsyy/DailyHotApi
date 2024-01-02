/**
 * @author: x-dr
 * @date: 2023-12-25
 * @customEditors: imsyy
 * @lastEditTime: 2024-01-02
 */

const Router = require("koa-router");
const ngabbsRouter = new Router();
const axios = require("axios");
const { get, set, del } = require("../utils/cacheData");

// 接口信息
const routerInfo = { name: "ngabbs", title: "NGA", subtitle: "论坛热帖" };

// 缓存键名
const cacheKey = "ngabbsData";

// 调用时间
let updateTime = new Date().toISOString();

const url =
  "https://ngabbs.com/nuke.php?__lib=load_topic&__act=load_topic_reply_ladder2&opt=1&all=1";

const headers = {
  Host: "ngabbs.com",
  "Content-Type": "application/x-www-form-urlencoded",
  Accept: "*/*",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Content-Length": "11",
  "User-Agent": "NGA/7.3.1 (iPhone; iOS 17.2.1; Scale/3.00)",
  "Accept-Language": "zh-Hans-CN;q=1",
  Referer: "https://ngabbs.com/",
  "X-User-Agent": "NGA_skull/7.3.1(iPhone13,2;iOS 17.2.1)",
};
const postData = { __output: "14" };

// 数据处理
const getData = (data) => {
  if (!data) return [];
  const dataList = [];
  try {
    const result = data.result[0];
    result.forEach((result) => {
      dataList.push({
        author: result.author,
        desc: result.subject,
        parent: result.parent["2"],
        tid: result.tid,
        comments: Number(result.replies),
        url: `https://bbs.nga.cn/read.php?tid=${result.tid}`,
        mobileUrl: `https://bbs.nga.cn/read.php?tid=${result.tid}`,
      });
    });
    return dataList;
  } catch (error) {
    console.error("数据处理出错" + error);
    return false;
  }
};

// NGA论坛热帖
ngabbsRouter.get("/ngabbs", async (ctx) => {
  console.log("获取NGA论坛热帖");
  try {
    // 从缓存中获取数据
    let data = await get(cacheKey);
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新获取NGA论坛热帖");
      // 从服务器拉取数据
      const response = await axios.post(url, postData, { headers });
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

// NGA论坛热帖 - 获取最新数据
ngabbsRouter.get("/ngabbs/new", async (ctx) => {
  console.log("获取NGA论坛热帖 - 最新数据");
  try {
    // 从服务器拉取最新数据
    const response = await axios.post(url, postData, { headers });
    const newData = getData(response.data);
    updateTime = new Date().toISOString();
    console.log("从服务端重新获取NGA论坛热帖");

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

ngabbsRouter.info = routerInfo;
module.exports = ngabbsRouter;
