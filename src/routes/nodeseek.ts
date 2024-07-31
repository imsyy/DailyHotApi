import type { RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { parseStringPromise } from "xml2js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const { fromCache, data, updateTime } = await getList(noCache);
  const routeData: RouterData = {
    name: "nodeseek",
    title: "NodeSeek",
    type: "最新",
    params: {
      type: {
        name: "分类",
        type: {
          all: "所有",
        },
      },
    },
    link: "https://www.nodeseek.com/",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = `https://rss.nodeseek.com/`;
  const result = await get({ url, noCache });

  const rssData = await parseStringPromise(result.data);

  const list = rssData.rss.channel[0].item;

  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: list.map((v: any) => ({
      id: v.guid[0]._,
      title: v.title[0],
      desc: v.description ? v.description[0] : "",
      author: v["dc:creator"] ? v["dc:creator"][0] : "unknown",
      timestamp: new Date(v.pubDate[0]).getTime(),
      hot: null, // NodeSeek RSS 中没有类似于hot的字段
      url: v.link[0],
      mobileUrl: v.link[0],
    })),
  };
};
