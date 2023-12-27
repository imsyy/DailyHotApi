/**
 *  @author: x-dr
 *  @date: 2023年12月27日
 *  @tags: [网易云音乐飙升榜]
 */


const URL = require('url');
const Router = require("koa-router");
const neteaseMusicRouter = new Router();
const axios = require("axios");
const cheerio = require("cheerio");
const { get, set, del } = require("../utils/cacheData");

// 接口信息
const routerInfo = {
    name: "neteasemusic",
    title: "网易云音乐",
    subtitle: "飙升榜",
};


// 缓存键名
const cacheKey = "neteasemusicData";

// 调用时间
let updateTime = new Date().toISOString();

const url = "https://music.163.com/discover/toplist?id=19723756";
// const url = "https://music.163.com/#/discover/toplist?id=19723756";

const headers = {
    'authority': 'music.163.com',
    'referer': 'https://music.163.com/',
};



// 数据处理
const getData = (data) => {
    if (!data) return false;
    const dataList = [];
    const $ = cheerio.load(data);
    try {
        $('.m-sgitem').each((i, e) => {
            const urlString = $(e).attr('href')
            const parsedUrl = URL.parse(urlString, true);
            const urlidValue = parsedUrl.query.id;
            const item = cheerio.load($(e).html())
            const author = item('div[class="f-thide sginfo"]').text().replace(/(^\s*)|(\s*$)/g, "")
            const title = item('div[class="f-thide sgtl"]').text().replace(/(^\s*)|(\s*$)/g, "")
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



// 
neteaseMusicRouter.get("/neteasemusic", async (ctx) => {
    console.log("获取neteasemusic ");
    try {
        // 从缓存中获取数据
        let data = await get(cacheKey);
        const from = data ? "cache" : "server";
        if (!data) {
            // 如果缓存中不存在数据
            console.log("从服务端重新neteasemusic ");
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
neteaseMusicRouter.get("/neteasemusic/new", async (ctx) => {
    console.log("获取neteasemusic   - 最新数据");
    try {
        // 从服务器拉取最新数据
        const response = await axios.get(url, { headers });
        const newData = getData(response.data);
        updateTime = new Date().toISOString();
        console.log("从服务端重新neteasemusic ");

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

neteaseMusicRouter.info = routerInfo;
module.exports = neteaseMusicRouter;