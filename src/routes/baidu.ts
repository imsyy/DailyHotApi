import type { RouterData, ListContext, Options } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "realtime";
  const { fromCache, data, updateTime } = await getList({ type }, noCache);
  const routeData: RouterData = {
    name: "baidu",
    title: "百度",
    type: "热搜榜",
    parameData: {
      type: {
        name: "热搜类别",
        type: {
          realtime: "热搜",
          novel: "小说",
          movie: "电影",
          teleplay: "电视剧",
          car: "汽车",
          game: "游戏",
        },
      },
    },
    link: "https://top.baidu.com/board",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean) => {
  const { type } = options;
  const url = `https://top.baidu.com/board?tab=${type}`;
  const result = await get({
    url,
    noCache,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/605.1.15",
    },
  });
  // 正则查找
  const pattern = /<!--s-data:(.*?)-->/s;
  const matchResult = result.data.match(pattern);
  const jsonObject = JSON.parse(matchResult[1]).cards[0].content;
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: jsonObject.map((v: RouterType["baidu"]) => ({
      id: v.index,
      title: v.word,
      desc: v.desc,
      cover: v.img,
      author: v.show?.length ? v.show : "",
      hot: Number(v.hotScore),
      url: `https://www.baidu.com/s?wd=${encodeURIComponent(v.query)}`,
      mobileUrl: v.rawUrl,
    })),
  };
};
