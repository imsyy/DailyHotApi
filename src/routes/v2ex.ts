import type { RouterData, ListContext, Options } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "hot";
  const listData = await getList({ type }, noCache);
  const routeData: RouterData = {
    name: "v2ex",
    title: "V2EX",
    type: "主题榜",
    params: {
      type: {
        name: "榜单分类",
        type: {
          hot: "最热主题",
          latest: "最新主题",
        },
      },
    },
    link: "https://www.v2ex.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean) => {
  const { type } = options;
  const url = `https://www.v2ex.com/api/topics/${type}.json`;
  const result = await get({ url, noCache });
  const list = result.data;
  return {
    ...result,
    data: list.map((v: RouterType["v2ex"]) => ({
      id: v.id,
      title: v.title,
      desc: v.content,
      author: v.member.username,
      timestamp: undefined,
      hot: v.replies,
      url: v.url,
      mobileUrl: v.url,
    })),
  };
};
