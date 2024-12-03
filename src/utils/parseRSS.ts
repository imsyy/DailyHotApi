import RSSParser from "rss-parser";
import logger from "./logger.js";

/**
 * 提取 RSS 内容
 * @param content HTML 内容
 * @returns RSS 内容
 */
export const extractRss = (content: string): string | null => {
  // 匹配 <rss> 标签及内容
  const rssRegex = /(<rss[\s\S]*?<\/rss>)/i;
  const matches = content.match(rssRegex);
  return matches ? matches[0] : null;
};

/**
 * 解析 RSS 内容
 * @param rssContent RSS 内容
 * @returns 解析后的 RSS 内容
 */
export const parseRSS = async (rssContent: string) => {
  const parser = new RSSParser();
  // 是否为网址
  const isUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };
  try {
    const feed = isUrl(rssContent)
      ? await parser.parseURL(rssContent)
      : await parser.parseString(rssContent);
    const items = feed.items.map((item) => ({
      title: item.title, // 文章标题
      link: item.link, // 文章链接
      pubDate: item.pubDate, // 发布日期
      author: item.creator ?? item.author, // 作者
      content: item.content, // 内容
      contentSnippet: item.contentSnippet, // 内容摘要
      guid: item.guid, // 全局唯一标识符
      categories: item.categories, // 分类
    }));
    // 返回解析数据
    return items;
  } catch (error) {
    logger.error("解析 RSS 内容时出错：", error);
    return [];
  }
};
