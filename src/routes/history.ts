import type { RouterData, ListContext, Options } from "../types.js";
import type { RouterType } from "../router.types.js";
import { load } from "cheerio";
import { get } from "../utils/getData.js";
import { getCurrentDateTime } from "../utils/getTime.js";

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  // 获取日期
  const day = c.req.query("day") || getCurrentDateTime(true).day;
  const month = c.req.query("month") || getCurrentDateTime(true).month;
  const { fromCache, data, updateTime } = await getList({ month, day }, noCache);
  const routeData: RouterData = {
    name: "history",
    title: "历史上的今天",
    type: `${month}-${day}`,
    params: {
      month: "月份",
      day: "日期",
    },
    link: "https://baike.baidu.com/calendar",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};
const getList = async (options: Options, noCache: boolean) => {
  const { month, day } = options;
  const monthStr = month?.toString().padStart(2, "0");
  const dayStr = day?.toString().padStart(2, "0");
  const url = `https://baike.baidu.com/cms/home/eventsOnHistory/${monthStr}.json`;
  const result = await get({
    url,
    noCache,
    params: {
      _: new Date().getTime(),
    },
  });
  const list = monthStr ? result.data[monthStr][monthStr + dayStr] : [];
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: list.map((v: RouterType["history"], index: number) => ({
      id: index,
      title: load(v.title).text().trim(),
      cover: v.cover ? v.pic_share : null,
      desc: load(v.desc).text().trim(),
      year: v.year,
      timestamp: null,
      hot: null,
      url: v.link,
      mobileUrl: v.link,
    })),
  };
};
