import type { RouterData, ListContext, Options, RouterResType } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";

const typeMap: Record<string, string> = {
  realtime: "热搜",
  novel: "小说",
  movie: "电影",
  teleplay: "电视剧",
  car: "汽车",
  game: "游戏",
};

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "realtime";
  const listData = await getList({ type }, noCache);
  const routeData: RouterData = {
    name: "baidu",
    title: "百度",
    type: typeMap[type],
    params: {
      type: {
        name: "热搜类别",
        type: typeMap,
      },
    },
    link: "https://top.baidu.com/board",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean): Promise<RouterResType> => {
  const { type } = options;
  const url = `https://top.baidu.com/board?tab=${type}`;
  const result = await get({
    url,
    noCache,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    },
  });
  // 正则查找
  const pattern = /<!--s-data:(.*?)-->/s;
  const matchResult = result.data.match(pattern);
  if (!matchResult) {
    return {
      ...result,
      data: [],
    };
  }
  const sData = JSON.parse(matchResult[1]);
  const cardContent = sData.data?.cards?.[0]?.content ?? sData.cards?.[0]?.content;
  const jsonObject = Array.isArray(cardContent)
    ? Array.isArray(cardContent[0]?.content)
      ? cardContent[0].content
      : cardContent
    : [];
  return {
    ...result,
    data: jsonObject.map((v: RouterType["baidu"], index: number) => {
      const title = v.word ?? v.title ?? "";
      return {
        id: v.index ?? index + 1,
        title,
        desc: v.desc ?? "",
        cover: v.img ?? v.imgInfo?.src ?? "",
        author: v.show?.length ? v.show : "",
        timestamp: 0,
        hot: Number(v.hotScore ?? v.hotTag ?? 0),
        url: `https://www.baidu.com/s?wd=${encodeURIComponent(v.query ?? title)}`,
        mobileUrl: v.rawUrl ?? v.url ?? "",
      };
    }),
  };
};
