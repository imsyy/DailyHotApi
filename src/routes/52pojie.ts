import type { RouterData, ListContext, Options, RouterResType } from "../types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";
import { parseRSS } from "../utils/parseRSS.js";
import iconv from "iconv-lite";

const typeMap: Record<string, string> = {
  digest: "最新精华",
  hot: "最新热门",
  new: "最新回复",
  newthread: "最新发表",
};

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "digest";
  const listData = await getList({ type }, noCache);
  const routeData: RouterData = {
    name: "52pojie",
    title: "吾爱破解",
    type: typeMap[type],
    params: {
      type: {
        name: "榜单分类",
        type: typeMap,
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
  const result = await get({
    url,
    noCache,
    responseType: "arraybuffer",
    headers: {
      userAgent:
        "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
    },
  });
  
  // 转码
  const utf8Data = iconv.decode(result.data, "gbk");
  const list = await parseRSS(utf8Data);
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
