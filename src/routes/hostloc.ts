import type { RouterData, ListContext, Options } from "../types.js";
import { get } from "../utils/getData.js";
import { parseRSS } from "../utils/parseRSS.js";
import { getTime } from "../utils/getTime.js";

const typeMap: Record<string, string> = {
  hot: "最新热门",
  digest: "最新精华",
  new: "最新回复",
  newthread: "最新发表",
};

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "hot";
  const listData = await getList({ type }, noCache);
  const routeData: RouterData = {
    name: "hostloc",
    title: "全球主机交流",
    type: typeMap[type],
    params: {
      type: {
        name: "榜单分类",
        type: typeMap,
      },
    },
    link: "https://hostloc.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean) => {
  const { type } = options;
  const url = `https://hostloc.com/forum.php?mod=guide&view=${type}&rss=1`;
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
      desc: v.content || "",
      author: v.author || "",
      timestamp: getTime(v.pubDate || 0),
      hot: undefined,
      url: v.link || "",
      mobileUrl: v.link || "",
    })),
  };
};
