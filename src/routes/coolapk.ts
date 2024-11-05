import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { genHeaders } from "../utils/getToken/coolapk.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const { fromCache, data, updateTime } = await getList(noCache);
  const routeData: RouterData = {
    name: "coolapk",
    title: "酷安",
    type: "热榜",
    link: "https://www.coolapk.com/",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = `https://api.coolapk.com/v6/page/dataList?url=/feed/statList?cacheExpires=300&statType=day&sortField=detailnum&title=今日热门&title=今日热门&subTitle=&page=1`;
  const result = await get({
    url,
    noCache,
    headers: await genHeaders(),
  });
  const list = result.data.data;
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: list.map((v: RouterType["coolapk"]) => ({
      id: v.id,
      title: v.message,
      cover: v.tpic,
      author: v.username,
      desc: v.ttitle,
      timestamp: null,
      hot: null,
      url: v.shareUrl,
      mobileUrl: v.shareUrl,
    })),
  };
};
