/*
 * @author: WangPeng
 * @date: 2023-07-11 16:41:48
 * @customEditors: imsyy
 * @lastEditTime: 2023-07-11 16:03:12
 */

const Router = require("koa-router");
const douyinMusicRouter = new Router();
const axios = require("axios");
const { get, set, del } = require("../utils/cacheData");

// 接口信息
const routerInfo = {
  name: "douyin",
  title: "抖音",
  subtitle: "热歌榜",
};

// 缓存键名
const cacheKey = "douyinMusicData";

// 调用时间
let updateTime = new Date().toISOString();

// 调用路径
const url = "https://aweme.snssdk.com/aweme/v1/chart/music/list/";
const HEADERS = {
  "user-agent": "okhttp3",
};
const QUERIES = {
  device_platform: "android",
  version_name: "13.2.0",
  version_code: "130200",
  aid: "1128",
  chart_id: "6853972723954146568",
  count: "100",
};

// 数据处理
const getData = (data) => {
  if (!data) return [];
  try {
    return data.map((v) => {
      const item = v.music_info;
      return {
        id: item.id,
        title: item.title,
        album: item.album,
        artist: item.author,
        pic: item?.cover_large.url_list[0],
        lyric: item.lyric_url,
        url: item.play_url.uri,
        mobileUrl: item.play_url.uri,
        // h5Url: item.matched_song?.h5_url,
      };
    });
  } catch (error) {
    console.error("数据处理出错" + error);
    return [];
  }
};

// 抖音热歌榜
douyinMusicRouter.get("/douyin_music", async (ctx) => {
  console.log("获取抖音热歌榜");
  try {
    // 从缓存中获取数据
    let data = await get(cacheKey);
    const from = data ? "cache" : "server";
    if (!data) {
      // 如果缓存中不存在数据
      console.log("从服务端重新获取抖音热歌榜");
      // 从服务器拉取数据
      const response = await axios.get(url, {
        headers: HEADERS,
        params: QUERIES,
      });
      data = getData(response.data.music_list);
      updateTime = new Date().toISOString();
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

// 抖音热歌榜 - 获取最新数据
douyinMusicRouter.get("/douyin_music/new", async (ctx) => {
  console.log("获取抖音热歌榜 - 最新数据");
  try {
    // 从服务器拉取最新数据
    const response = await axios.get(url, {
      headers: HEADERS,
      params: QUERIES,
    });
    const newData = getData(response.data.word_list);
    updateTime = new Date().toISOString();
    console.log("从服务端重新获取抖音热歌榜");

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

douyinMusicRouter.info = routerInfo;
module.exports = douyinMusicRouter;
