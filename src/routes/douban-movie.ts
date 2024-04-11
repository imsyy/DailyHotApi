import type { RouterData } from "../types.js";
import { load } from "cheerio";
import { get } from "../utils/getData.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const { fromCache, data, updateTime } = await getList(noCache);
  const routeData: RouterData = {
    name: "douban-movie",
    title: "豆瓣电影",
    type: "新片排行榜",
    link: "https://movie.douban.com/chart",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

// 数据处理
const getNumbers = (text: string | undefined) => {
  if (!text) return 10000000;
  const regex = /\d+/;
  const match = text.match(regex);
  if (match) {
    return Number(match[0]);
  } else {
    return 10000000;
  }
};

const getList = async (noCache: boolean) => {
  const url = `https://movie.douban.com/chart/`;
  const result = await get({
    url,
    noCache,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    },
  });
  const $ = load(result.data);
  const listDom = $(".article tr.item");
  const listData = listDom.toArray().map((item) => {
    const dom = $(item);
    const url = dom.find("a").attr("href") || undefined;
    const score = dom.find(".rating_nums").text() ?? "0.0";
    return {
      id: getNumbers(url),
      title: `【${score}】${dom.find("a").attr("title")}`,
      cover: dom.find("img").attr("src"),
      desc: dom.find("p.pl").text(),
      hot: getNumbers(dom.find("span.pl").text()),
      url,
      mobileUrl:`https://m.douban.com/movie/subject/${getNumbers(url)}/`,
    };
  });
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: listData,
  };
};
