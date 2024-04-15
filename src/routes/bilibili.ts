import type { RouterData, ListContext, Options } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import getBiliWbi from "../utils/getBiliWbi.js";

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "0";
  const { fromCache, data, updateTime } = await getList({ type }, noCache);
  const routeData: RouterData = {
    name: "bilibili",
    title: "哔哩哔哩",
    type: "热门榜",
    description: "你所热爱的，就是你的生活",
    parameData: {
      type: {
        name: "排行榜分区",
        type: {
          0: "全站",
          1: "动画",
          3: "音乐",
          4: "游戏",
          5: "娱乐",
          36: "科技",
          119: "鬼畜",
          129: "舞蹈",
          155: "时尚",
          160: "生活",
          168: "国创相关",
          188: "数码",
          181: "影视",
        },
      },
    },
    link: "https://www.bilibili.com/v/popular/rank/all",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean) => {
  const { type } = options;
  const wbiData = await getBiliWbi();
  const url = `https://api.bilibili.com/x/web-interface/ranking/v2?tid=${type}&type=all&${wbiData}`;
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
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: list.map((v: RouterType["bilibili"]) => ({
      id: v.bvid,
      title: v.title,
      desc: v.desc,
      cover: v.pic.replace(/http:/, "https:"),
      author: v.owner.name,
      hot: v.stat.view,
      url: v.short_link_v2 || `https://www.bilibili.com/video/${v.bvid}`,
      mobileUrl: `https://m.bilibili.com/video/${v.bvid}`,
    })),
  };
};
