import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";
import { config } from "../config";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "weibo",
    title: "微博",
    type: "热搜榜",
    description: "实时热点，每分钟更新一次",
    link: "https://s.weibo.com/top/summary/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = "https://weibo.com/ajax/side/hotSearch";

  const result = await get({
    url,
    noCache,
    ttl: 60,
    headers: {
      Referer: "https://weibo.com/",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  if (!result.data?.data?.realtime) {
    return { ...result, data: [] };
  }

  const list = result.data.data.realtime;
  return {
    ...result,
    data: list.map((v: any, index: number) => {
      const title = v.word || v.word_scheme || `热搜${index + 1}`;
      return {
        id: v.mid || v.word_scheme || `weibo-${index}`,
        title: title,
        desc: v.word_scheme || `#${title}#`,
        timestamp: getTime(v.onboard_time || Date.now()),
        url: `https://s.weibo.com/weibo?q=${encodeURIComponent(title)}`,
        mobileUrl: `https://s.weibo.com/weibo?q=${encodeURIComponent(title)}`,
      };
    }),
  };
};
