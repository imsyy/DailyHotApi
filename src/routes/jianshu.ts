import type { RouterData } from "../types.js";
import { load } from "cheerio";
import { get } from "../utils/getData.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "jianshu",
    title: "简书",
    type: "热门推荐",
    description: "一个优质的创作社区",
    link: "https://www.jianshu.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

// 获取 ID
const getID = (url: string) => {
  if (!url) return "undefined";
  const match = url.match(/([^/]+)$/);
  return match ? match[1] : "undefined";
};

const getList = async (noCache: boolean) => {
  const url = `https://www.jianshu.com/`;
  const result = await get({
    url,
    noCache,
    headers: {
      Referer: "https://www.jianshu.com",
    },
  });
  const $ = load(result.data);
  const listDom = $("ul.note-list li");
  const listData = listDom.toArray().map((item) => {
    const dom = $(item);
    const href = dom.find("a").attr("href") || "";
    return {
      id: getID(href),
      title: dom.find("a.title").text()?.trim(),
      cover: dom.find("img").attr("src"),
      desc: dom.find("p.abstract").text()?.trim(),
      author: dom.find("a.nickname").text()?.trim(),
      hot: undefined,
      timestamp: undefined,
      url: `https://www.jianshu.com${href}`,
      mobileUrl: `https://www.jianshu.com${href}`,
    };
  });
  return {
    ...result,
    data: listData,
  };
};
