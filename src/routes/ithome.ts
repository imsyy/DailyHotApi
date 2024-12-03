import type { RouterData } from "../types.js";
import { load } from "cheerio";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const { fromCache, data, updateTime } = await getList(noCache);
  const routeData: RouterData = {
    name: "ithome",
    title: "IT之家",
    type: "热榜",
    description: "爱科技，爱这里 - 前沿科技新闻网站",
    link: "https://m.ithome.com/rankm/",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

// 链接处理
const replaceLink = (url: string, getId: boolean = false) => {
  const match = url.match(/[html|live]\/(\d+)\.htm/);
  // 是否匹配成功
  if (match && match[1]) {
    return getId
      ? match[1]
      : `https://www.ithome.com/0/${match[1].slice(0, 3)}/${match[1].slice(3)}.htm`;
  }
  // 返回原始 URL
  return url;
};

const getList = async (noCache: boolean) => {
  const url = `https://m.ithome.com/rankm/`;
  const result = await get({ url, noCache });
  const $ = load(result.data);
  const listDom = $(".rank-box .placeholder");
  const listData = listDom.toArray().map((item) => {
    const dom = $(item);
    const href = dom.find("a").attr("href");
    return {
      id: href ? Number(replaceLink(href, true)) : 100000,
      title: dom.find(".plc-title").text().trim(),
      cover: dom.find("img").attr("data-original"),
      timestamp: getTime(dom.find("span.post-time").text().trim()),
      hot: Number(dom.find(".review-num").text().replace(/\D/g, "")),
      url: href ? replaceLink(href) : "",
      mobileUrl: href ? replaceLink(href) : "",
    };
  });
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: listData,
  };
};
