import type { RouterData, ListContext, Options, RouterResType } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import getBiliWbi from "../utils/getToken/bilibili.js";
import { getTime } from "../utils/getTime.js";
import logger from "../utils/logger.js";
const typeMap: Record<string, string> = {
  "0": "全站",
  "1": "动画",
  "3": "音乐",
  "4": "游戏",
  "5": "娱乐",
  "188": "科技",
  "119": "鬼畜",
  "129": "舞蹈",
  "155": "时尚",
  "160": "生活",
  "168": "国创相关",
  "181": "影视",
};

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "0";
  const listData = await getList({ type }, noCache);
  const routeData: RouterData = {
    name: "bilibili",
    title: "哔哩哔哩",
    type: `热榜 · ${typeMap[type]}`,
    description: "你所热爱的，就是你的生活",
    params: {
      type: {
        name: "排行榜分区",
        type: typeMap,
      },
    },
    link: "https://www.bilibili.com/v/popular/rank/all",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean): Promise<RouterResType> => {
  const { type } = options;
  const wbiData = await getBiliWbi();
  const url = `https://api.bilibili.com/x/web-interface/ranking/v2?rid=${type}&type=all&${wbiData}`;
  const result = await get({
    url,
    headers: {
      'Referer': 'https://www.bilibili.com/ranking/all',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    },
    noCache: false,
  });

  // 是否触发风控
  if (result.data?.data?.list?.length > 0) {
    logger.info('bilibili 新接口')
    const list = result.data.data.list;
    return {
      fromCache: result.fromCache,
      updateTime: result.updateTime,
      data: list.map((v: RouterType["bilibili"]) => ({
        id: v.bvid,
        title: v.title,
        desc: v.desc || "该视频暂无简介",
        cover: v.pic?.replace(/http:/, "https:"),
        author: v.owner?.name,
        timestamp: getTime(v.pubdate),
        hot: v.stat?.view || 0,
        url: v.short_link_v2 || `https://www.bilibili.com/video/${v.bvid}`,
        mobileUrl: `https://m.bilibili.com/video/${v.bvid}`,
      })),
    };
  }
  // 采用备用接口
  else {
    logger.info('bilibili 备用接口')
    const url = `https://api.bilibili.com/x/web-interface/ranking?jsonp=jsonp?rid=${type}&type=all&callback=__jp0`;
    const result = await get({
      url,
      headers: {
        Referer: `https://www.bilibili.com/ranking/all`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      },
      noCache,
    });
    const list = result.data.data.list;
    return {
      ...result,
      data: list.map((v: RouterType["bilibili"]) => ({
        id: v.bvid,
        title: v.title,
        desc: v.desc || "该视频暂无简介",
        cover: v.pic?.replace(/http:/, "https:"),
        author: v.author,
        timestamp: undefined,
        hot: v.video_review,
        url: `https://www.bilibili.com/video/${v.bvid}`,
        mobileUrl: `https://m.bilibili.com/video/${v.bvid}`,
      })),
    };
  }
};
