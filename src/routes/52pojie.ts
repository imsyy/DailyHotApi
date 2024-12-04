import type { RouterData, ListContext, Options, RouterResType } from "../types.js";
import { web } from "../utils/getData.js";
import { extractRss, parseRSS } from "../utils/parseRSS.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "hot";
  const listData = await getList({ type }, noCache);
  const routeData: RouterData = {
    name: "52pojie",
    title: "吾爱破解",
    type: "榜单",
    params: {
      type: {
        name: "榜单分类",
        type: {
          tech: "新鲜出炉",
          newthread: "技术分享",
          hot: "人气热门",
          digest: "精华采撷",
        },
      },
    },
    link: "https://www.52pojie.cn/",
    total: listData?.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean): Promise<RouterResType> => {
  const { type } = options;
  const url = `https://www.52pojie.cn/forum.php?mod=guide&view=${type}&rss=1`;
  const result = await web({
    url,
    noCache,
    userAgent:
      "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
  });
  const parseData = async () => {
    if (typeof result?.data !== "string") return [];
    const rssContent = extractRss(result.data);
    if (!rssContent) return [];
    return await parseRSS(rssContent);
  };
  const list = await parseData();
  return {
    ...result,
    data: list.map((v, i) => ({
      id: v.guid || i,
      title: v.title || "",
      desc: v.content || "",
      author: v.author || "",
      timestamp: getTime(v.pubDate || 0),
      hot: 0,
      url: v.link || "",
      mobileUrl: v.link || "",
    })),
  };
};
