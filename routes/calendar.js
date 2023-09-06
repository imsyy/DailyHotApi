const Router = require("koa-router");
const calendarRouter = new Router();
const axios = require("axios");
const { get, set } = require("../utils/cacheData");

// 缓存键名
const cacheKey = "calendarData";

// 调用时间
let updateTime = new Date().toISOString();

// 获取月份
const month = (new Date().getMonth() + 1).toString().padStart(2, "0");

// 获取天数
const day = new Date().getDate().toString().padStart(2, "0");

// 调用路径
const url = `https://baike.baidu.com/cms/home/eventsOnHistory/${month}.json`;

// 数据处理
const getData = (data) => {
  if (!data) return [];
  return data.map((v) => {
    return {
      year: v.year,
      title: v.title.replace(/<[^>]+>/g, ""),
      desc: v.desc.replace(/<[^>]+>/g, ""),
      pic: v?.pic_share || v?.pic_index,
      avatar: v?.pic_calendar,
      type: v.type,
      url: v.link,
      mobileUrl: v.link,
    };
  });
};

// 历史上的今天
calendarRouter.get("/calendar", async (ctx) => {
  console.log("获取历史上的今天");
  try {
    // 从缓存中获取数据
    let data = await get(cacheKey);
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新获取历史上的今天");
      // 从服务器拉取数据
      const response = await axios.get(url);
      data = getData(response.data[month][month + day]);
      updateTime = new Date().toISOString();
      if (!data) {
        ctx.body = {
          code: 500,
          title: "历史上的今天",
          subtitle: month + "-" + day,
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
      title: "历史上的今天",
      subtitle: month + "-" + day,
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

// 历史上的今天 - 获取指定日期
calendarRouter.get("/calendar/date", async (ctx) => {
  console.log("获取历史上的今天 - 指定日期");
  try {
    // 获取参数
    const { month, day } = ctx.query;
    if (!month || !day) {
      ctx.body = { code: 400, message: "参数不完整" };
      return false;
    }
    if (month.length == 1 || day.length == 1) {
      ctx.body = { code: 400, message: "参数格式错误" };
      return false;
    }
    // 从服务器拉取最新数据
    const response = await axios.get(
      `https://baike.baidu.com/cms/home/eventsOnHistory/${month}.json`,
    );
    const newData = getData(response.data[month][month + day]);
    updateTime = new Date().toISOString();
    console.log("从服务端重新获取历史上的今天");
    // 返回数据
    ctx.body = {
      code: 200,
      message: "获取成功",
      title: "历史上的今天",
      subtitle: month + "-" + day,
      total: newData.length,
      updateTime,
      data: newData,
    };
  } catch (error) {
    // 返回错误信息
    ctx.body = {
      code: 500,
      title: "历史上的今天",
      subtitle: month + "-" + day,
      message: "获取失败",
    };
  }
});

module.exports = calendarRouter;
