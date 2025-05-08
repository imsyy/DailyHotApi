import type { RouterData, ListItem } from "../types.ts";
import { Feed } from "feed";
import logger from "./logger.js";

// 生成 RSS
const getRSS = (data: RouterData) => {
  try {
    // 基本信息
    const feed = new Feed({
      title: data.title,
      description: data.title + data.type + (data?.description ? " - " + data?.description : ""),
      id: data.name,
      link: data.link,
      language: "zh",
      generator: "DailyHotApi",
      copyright: "Copyright © 2020-present imsyy",
      updated: new Date(data.updateTime),
    });
    // 获取数据
    const listData = data.data;
    listData.forEach((item: ListItem) => {
      feed.addItem({
        id: item.id?.toString(),
        title: item.title,
        date: new Date(data.updateTime),
        link: item.url || "获取失败",
        description: item?.desc,
        author: [
          {
            name: item.author,
          },
        ],
        extensions: [
          {
            name: "media:content",
            objects: {
              _attributes: {
                "xmlns:media": "http://search.yahoo.com/mrss/",
                url: item.cover,
              },
              "media:thumbnail": {
                _attributes: {
                  url: item.cover,
                },
              },
              "media:description": item.desc ? {
                _cdata: item.desc
              } : "",
            }
          }
        ]
      });
    });
    const rssData = feed.rss2();
    return rssData;
  } catch (error) {
    logger.error("❌ [ERROR] getRSS failed");
    throw error;
  }
};

export default getRSS;
