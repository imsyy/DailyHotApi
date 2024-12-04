import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "netease-news",
    title: "网易新闻",
    type: "热点榜",
    link: "https://m.163.com/hot",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = `https://m.163.com/fe/api/hot/news/flow`;
  const result = await get({ url, noCache });
  const list = result.data.data.list;
  return {
    ...result,
    data: list.map((v: RouterType["netease-news"]) => ({
      id: v.docid,
      title: v.title,
      cover: v.imgsrc,
      author: v.source,
      hot: undefined,
      timestamp: getTime(v.ptime),
      url: `https://www.163.com/dy/article/${v.docid}.html`,
      mobileUrl: `https://m.163.com/dy/article/${v.docid}.html`,
    })),
  };
};
