import type { RouterData, ListContext, Options } from "../types.js";
import { load } from "cheerio";
import { get } from "../utils/getData.js";
import { getCurrentDateTime } from "../utils/getTime.js";

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  // 获取日期
  const day = c.req.query("day") || getCurrentDateTime().day;
  const month = c.req.query("month") || getCurrentDateTime().month;
  const { fromCache, data, updateTime } = await getList({ month, day }, noCache);
  const routeData: RouterData = {
    name: "history",
    title: "历史上的今天",
    type: `${month}-${day}`,
    parame: {
      month: "月份",
      day: "日期",
    },
    link: "https://www.lssjt.com/",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};
const getList = async (options: Options, noCache: boolean) => {
  const { month, day } = options;
  const url = `https://www.lssjt.com/${month}/${day}/`;
  const result = await get({ url, noCache });
  const $ = load(result.data);
  const listDom = $("li.circler");
  const listData = listDom.toArray().map((item, index) => {
    const dom = $(item);
    const href = dom.find("a").attr("href");
    return {
      id: index,
      title: dom.find("a.txt").text().trim() || dom.find("a").attr("title"),
      cover: dom.find("img").attr("data-original"),
      timestamp: dom.find("div.text span").text().trim() || dom.find("div.t span").text().trim(),
      hot: null,
      url: href || undefined,
      mobileUrl: href || undefined,
    };
  });
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: listData,
  };
};
