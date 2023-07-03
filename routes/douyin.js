const Router = require("koa-router");
const douyinRouter = new Router();
const axios = require("axios");
const { get, set, del } = require("../utils/cacheData");

// 缓存键名
const cacheKey = "douyinHotData";
const cacheCookieKey = "douyinCookieData";

// 调用时间
let updateTime = new Date().toISOString();

// 调用路径
const url =
  "https://www.douyin.com/aweme/v1/web/hot/search/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&detail_list=1&round_trip_time=50";

// Token 获取路径
const cookisUrl =
  "https://www.douyin.com/passport/general/login_guiding_strategy/?aid=6383";

// 数据处理
const getData = (data) => {
  if (!data) return [];
  const dataList = [];
  try {
    const jsonObject = data.data.word_list;
    jsonObject.forEach((v) => {
      dataList.push({
        title: v.word,
        pic: `${v.word_cover.url_list[0]}`,
        hot: Number(v.hot_value),
        url: `https://www.douyin.com/hot/${encodeURIComponent(v.sentence_id)}`,
        mobileUrl: `https://www.douyin.com/hot/${encodeURIComponent(
          v.sentence_id
        )}`,
      });
    });
    return dataList;
  } catch (error) {
    console.error("数据处理出错" + error);
    return [];
  }
};

// 处理抖音 Cookis
const setDouyinCookies = (data) => {
  if (!data) return null;
  try {
    const pattern = /passport_csrf_token=(.*); Path/s;
    const matchResult = data.headers["set-cookie"][0].match(pattern);
    const cookieData = matchResult[1];
    return cookieData;
  } catch (error) {
    console.error("获取抖音 Cookie 出错" + error);
    return null;
  }
};

// 获取抖音 Cookie数据
const getDouyinCookie = async () => {
  try {
    let cookie = await get(cacheCookieKey);
    if (!cookie) {
      const cookisResponse = await axios.get(cookisUrl);
      cookie = setDouyinCookies(cookisResponse);
      console.log("抖音 Cookie 写入缓存", cookie);
      await set(cacheCookieKey, cookie);
    }
    return cookie;
  } catch (error) {
    console.error("获取抖音 Cookie 出错", error);
    return null;
  }
};

// 抖音热点榜
douyinRouter.get("/douyin", async (ctx) => {
  console.log("获取抖音热点榜");
  try {
    // 从缓存中获取数据
    let data = await get(cacheKey);
    const cookie = await getDouyinCookie();
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新获取抖音热点榜");
      // 从服务器拉取数据
      const response = await axios.get(url, {
        headers: {
          Cookie: `passport_csrf_token=${cookie}`,
        },
      });
      data = getData(response.data);
      updateTime = new Date().toISOString();
      if (!data) {
        ctx.body = {
          code: 500,
          title: "抖音热点榜",
          subtitle: "热点榜",
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
      title: "抖音热点榜",
      subtitle: "热点榜",
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

// 抖音热点榜 - 获取最新数据
douyinRouter.get("/douyin/new", async (ctx) => {
  console.log("获取抖音热点榜 - 最新数据");
  try {
    // 从服务器拉取最新数据
    const cookie = await getDouyinCookie();
    const response = await axios.get(url, {
      headers: {
        Cookie: `passport_csrf_token=${cookie}`,
      },
    });
    const newData = getData(response.data);
    updateTime = new Date().toISOString();
    console.log("从服务端重新获取抖音热点榜");

    // 返回最新数据
    ctx.body = {
      code: 200,
      message: "获取成功",
      title: "抖音热点榜",
      subtitle: "热点榜",
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
        title: "抖音热点榜",
        subtitle: "热点榜",
        total: cachedData.length,
        updateTime,
        data: cachedData,
      };
    } else {
      // 如果缓存中也没有数据，则返回错误信息
      ctx.body = {
        code: 500,
        title: "抖音热点榜",
        subtitle: "热点榜",
        message: "获取失败",
      };
    }
  }
});

module.exports = douyinRouter;
