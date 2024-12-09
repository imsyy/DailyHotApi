import type { RouterData, ListContext, Options, RouterResType } from "../types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";
import { parseRSS } from "../utils/parseRSS.js";

const areaMap: Record<string, string> = {
  china: "中文网",
  global: "全球版",
};

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const area = c.req.query("type") || "china";
  const listData = await getList({ area }, noCache);
  const routeData: RouterData = {
    name: "nytimes",
    title: "纽约时报",
    type: areaMap[area],
    params: {
      area: {
        name: "地区分类",
        type: areaMap,
      },
    },
    link: "https://www.nytimes.com/",
    total: listData?.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean): Promise<RouterResType> => {
  const { area } = options;
  const url =
    area === "china"
      ? "https://cn.nytimes.com/rss/"
      : "https://rss.nytimes.com/services/xml/rss/nyt/World.xml";
  const result = await get({
    url,
    noCache,
    headers: {
      userAgent:
        "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
    },
  });
  const list = await parseRSS(result.data);
  return {
    ...result,
    data: list.map((v, i) => ({
      id: v.guid || i,
      title: v.title || "",
      desc: v.content?.trim() || "",
      author: v.author,
      timestamp: getTime(v.pubDate || 0),
      hot: undefined,
      url: v.link || "",
      mobileUrl: v.link || "",
    })),
  };
};
