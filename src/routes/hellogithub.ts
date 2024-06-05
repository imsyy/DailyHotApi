import type { RouterData, ListContext, Options } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import getTime from "../utils/getTime.js";

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const sort = c.req.query("sort") || "hot";
  const { fromCache, data, updateTime } = await getList({ sort }, noCache);
  const routeData: RouterData = {
    name: "hellogithub",
    title: "HelloGitHub",
    type: "热门仓库",
    description: "分享 GitHub 上有趣、入门级的开源项目",
    parameData: {
      sort: {
        name: "排行榜分区",
        type: {
          hot: "热门",
          last: "最新",
        },
      },
    },
    link: "https://hellogithub.com/",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean) => {
  const { sort } = options;
  const url = `https://abroad.hellogithub.com/v1/?sort_by=${sort}&tid=&page=1`;
  const result = await get({ url, noCache });
  const list = result.data.data;
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: list.map((v: RouterType["hellogithub"]) => ({
      id: v.item_id,
      title: v.title,
      desc: v.summary,
      author: v.author,
      timestamp: getTime(v.updated_at),
      hot: v.clicks_total,
      url: `https://hellogithub.com/repository/${v.item_id}`,
      mobileUrl: `https://hellogithub.com/repository/${v.item_id}`,
    })),
  };
};
