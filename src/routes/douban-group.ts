import type { RouterData } from "../types.js";
import { load } from "cheerio";
import { get } from "../utils/getData.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const { fromCache, data, updateTime } = await getList(noCache);
  const routeData: RouterData = {
    name: "douban-group",
    title: "豆瓣讨论",
    type: "讨论精选",
    link: "https://www.douban.com/group/explore",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

// 数据处理
const getNumbers = (text: string | undefined) => {
  if (!text) return 100000000;
  const regex = /\d+/;
  const match = text.match(regex);
  if (match) {
    return Number(match[0]);
  } else {
    return 100000000;
  }
};

const getList = async (noCache: boolean) => {
  const url = `https://www.douban.com/group/explore`;
  const result = await get({ url, noCache });
  const $ = load(result.data);
  const listDom = $(".article .channel-item");
  const listData = listDom.toArray().map((item) => {
    const dom = $(item);
    const url = dom.find("h3 a").attr("href") || undefined;
    return {
      id: getNumbers(url),
      title: dom.find("h3 a").text().trim(),
      cover: dom.find(".pic-wrap img").attr("src"),
      desc: dom.find(".block p").text().trim(),
      url,
      mobileUrl: `https://m.douban.com/group/topic/${getNumbers(url)}/`,
    };
  });
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: listData,
  };
};
