import type { RouterData, ListContext, Options } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "1";
  const listData = await getList({ type }, noCache);
  const routeData: RouterData = {
    name: "hupu",
    title: "虎扑",
    type: "步行街热帖",
    params: {
      type: {
        name: "榜单分类",
        type: {
          1: "主干道",
          6: "恋爱区",
          11: "校园区",
          12: "历史区",
          612: "摄影区",
        },
      },
    },
    link: "https://bbs.hupu.com/all-gambia",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean) => {
  const { type } = options;
  const url = `https://m.hupu.com/api/v2/bbs/topicThreads?topicId=${type}&page=1`;
  const result = await get({ url, noCache });
  const list = result.data.data.topicThreads;
  return {
    ...result,
    data: list.map((v: RouterType["hupu"]) => ({
      id: v.tid,
      title: v.title,
      author: v.username,
      hot: v.replies,
      timestamp: undefined,
      url: `https://bbs.hupu.com/${v.tid}.html`,
      mobileUrl: v.url,
    })),
  };
};
