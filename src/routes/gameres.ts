import type { RouterData } from "../types.js";
import { load } from "cheerio";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";
import { RouterType } from "../router.types.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);

  const routeData: RouterData = {
    name: "gameres",
    title: "GameRes 游资网",
    type: "最新资讯",
    description:
      "面向游戏从业者的游戏开发资讯，旨在为游戏制作人提供游戏研发类的程序技术、策划设计、艺术设计、原创设计等资讯内容。",
    link: "https://www.gameres.com",
    total: listData.data?.length || 0,
    ...listData,
  };

  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = `https://www.gameres.com`;
  const result = await get({ url, noCache });
  const $ = load(result.data);

  const container = $('div[data-news-pane-id="100000"]');
  const listDom = container.find("article.feed-item");

  const listData = Array.from(listDom).map((el) => {
    const dom = $(el);

    const titleEl = dom.find(".feed-item-title-a").first();
    const title = titleEl.text().trim();

    const href = titleEl.attr("href");
    const url = href?.startsWith("http") ? href : `https://www.gameres.com${href ?? ""}`;

    const cover = dom.find(".thumb").attr("data-original") || "";
    const desc = dom.find(".feed-item-right > p").first().text().trim();

    const dateTime = dom.find(".mark-info").contents().first().text().trim();
    const timestamp = getTime(dateTime);

    // 热度（列表暂无评论数）
    const hot = undefined;

    return {
      title,
      desc,
      cover,
      timestamp,
      hot,
      url,
      id: url,
      mobileUrl: url,
    } as RouterType["gameres"];
  });

  return {
    ...result,
    data: listData,
  };
};
