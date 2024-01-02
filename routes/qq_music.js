/**
 *  @author: x-dr
 *  @date: 2023年12月27日
 *  @tags: [QQ音乐热歌榜]
 */

// const fs = require("fs");
const Router = require("koa-router");
const qqMusicRouter = new Router();
const axios = require("axios");
const cheerio = require("cheerio");
const { get, set, del } = require("../utils/cacheData");

// 接口信息
const routerInfo = {
    name: "qqmusic",
    title: "QQ音乐",
    subtitle: "热歌榜",
};


// 缓存键名
const cacheKey = "qqmusicData";

// 调用时间
let updateTime = new Date().toISOString();

const url = "https://y.qq.com/n/ryqq/toplist/26";

const headers = {
    'authority': 'y.qq.com',
    'referer': 'https://www.google.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};



// 数据处理
const getData = (data) => {
    if (!data) return false;
    const dataList = [];
    const $ = cheerio.load(data);
    // fs.writeFileSync('qq.html', $.html());
    try {
        $('.songlist__item').each((i, e) => {
            const item = cheerio.load($(e).html())
            const title = item('a[class="songlist__cover"]').attr('title')
            const urlPath = item('a[class="songlist__cover"]').attr('href')
            const author = item('div[class="songlist__artist"]').text().replace(/(^\s*)|(\s*$)/g, "")
            const songtime = item('div[class="songlist__time"]').text().replace(/(^\s*)|(\s*$)/g, "")
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



// 
qqMusicRouter.get("/qqmusic", async (ctx) => {
    console.log("获取QQ音乐热歌榜 ");
    try {
        // 从缓存中获取数据
        let data = await get(cacheKey);
        const from = data ? "cache" : "server";
        if (!data) {
            // 如果缓存中不存在数据
            console.log("从服务端重新QQ音乐热歌榜 ");
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
qqMusicRouter.get("/qqmusic/new", async (ctx) => {
    console.log("获取QQ音乐热歌榜  - 最新数据");
    try {
        // 从服务器拉取最新数据
        const response = await axios.get(url, { headers });
        const newData = getData(response.data);
        updateTime = new Date().toISOString();
        console.log("从服务端重新QQ音乐热歌榜 ");

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

qqMusicRouter.info = routerInfo;
module.exports = qqMusicRouter;