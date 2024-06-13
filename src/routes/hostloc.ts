import type { RouterData, ListContext, Options } from "../types.js";
import type { RouterType } from "../router.types.js";
import { web } from "../utils/getData.js";
import { extractRss, parseRSS } from "../utils/parseRSS.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "hot";
  const { fromCache, data, updateTime } = await getList({ type }, noCache);
  const routeData: RouterData = {
    name: "hostloc",
    title: "全球主机交流",
    type: "榜单",
    parame: {
      type: {
        name: "榜单分类",
        type: {
          hot: "最新热门",
          digest: "最新精华",
          new: "最新回复",
          newthread: "最新发表",
        },
      },
    },
    link: "https://hostloc.com/",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean) => {
  const { type } = options;
  const url = `https://hostloc.com/forum.php?mod=guide&view=${type}&rss=1`;
  const result = await web({
    url,
    noCache,
    userAgent:
      "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
  });
  const parseData = async () => {
    if (typeof result?.data === "string") {
      const rssContent = extractRss(result.data);
      return await parseRSS(rssContent);
    } else {
      return [];
    }
  };
  const list = await parseData();
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: list.map((v: RouterType["discuz"]) => ({
      id: v.guid,
      title: v.title,
      desc: v.content,
      author: v.author,
      timestamp: getTime(v.pubDate),
      hot: null,
      url: v.link,
      mobileUrl: v.link,
    })),
  };
};
