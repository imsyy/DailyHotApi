import type { ListContext, RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import getWereadID from "../utils/getToken/weread.js";
import { getTime } from "../utils/getTime.js";

const typeMap: Record<string, string> = {
  rising: "飙升榜",
  hot_search: "热搜榜",
  newbook: "新书榜",
  general_novel_rising: "小说榜",
  all: "总榜",
};

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "rising";
  const listData = await getList(noCache, type);
  const routeData: RouterData = {
    name: "weread",
    title: "微信读书",
    type: `${typeMap[type]}`,
    params: {
      type: {
        name: "排行榜分区",
        type: typeMap,
      },
    },
    link: "https://weread.qq.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean, type='rising') => {
  const url = `https://weread.qq.com/web/bookListInCategory/${type}?rank=1`;
  const result = await get({
    url,
    noCache,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67",
    },
  });
  const list = result.data.books;
  return {
    ...result,
    data: list.map((v: RouterType["weread"]) => {
      const data = v.bookInfo;
      return {
        id: data.bookId,
        title: data.title,
        author: data.author,
        desc: data.intro,
        cover: data.cover.replace("s_", "t9_"),
        timestamp: getTime(data.publishTime),
        hot: v.readingCount,
        url: `https://weread.qq.com/web/bookDetail/${getWereadID(data.bookId)}`,
        mobileUrl: `https://weread.qq.com/web/bookDetail/${getWereadID(data.bookId)}`,
      };
    }),
  };
};
