import type { RouterData, ListContext, Options } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "热门文章";
  const { fromCache, data, updateTime } = await getList({ type }, noCache);
  const routeData: RouterData = {
    name: "sspai",
    title: "少数派",
    type: "热榜",
    parameData: {
      type: {
        name: "分类",
        type: ["热门文章", "应用推荐", "生活方式", "效率技巧", "少数派播客"],
      },
    },
    link: "https://sspai.com/",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean) => {
  const { type } = options;
  const url = `https://sspai.com/api/v1/article/tag/page/get?limit=40&tag=${type}`;
  const result = await get({ url, noCache });
  const list = result.data.data;
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: list.map((v: RouterType["sspai"]) => ({
      id: v.id,
      title: v.title,
      desc: v.summary,
      cover: v.banner,
      author: v.author.nickname,
      hot: v.like_count,
      url: `https://sspai.com/post/${v.id}`,
      mobileUrl: `https://sspai.com/post/${v.id}`,
    })),
  };
};
