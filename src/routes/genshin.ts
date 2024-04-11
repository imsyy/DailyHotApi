import type { RouterData, ListContext, Options } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "1";
  const { fromCache, data, updateTime } = await getList({ type }, noCache);
  const routeData: RouterData = {
    name: "genshin",
    title: "原神",
    type: "最新动态",
    parameData: {
      type: {
        name: "榜单分类",
        type: {
          1: "公告",
          2: "活动",
          3: "资讯",
        },
      },
    },
    link: "https://www.miyoushe.com/ys/home/28",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean) => {
  const { type } = options;
  const url = `https://bbs-api.miyoushe.com/post/wapi/getNewsList?gids=2&page_size=20&type=${type}`;
  const result = await get({ url, noCache });
  const list = result.data.data.list;
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: list.map((v: RouterType["miyoushe"]) => {
      const data = v.post;
      return {
        id: data.post_id,
        title: data.subject,
        desc: data.content,
        cover: data.cover,
        author: v.user.nickname,
        hot: v.stat.view_num,
        url: `https://www.miyoushe.com/ys/article/${data.post_id}`,
        mobileUrl: `https://m.miyoushe.com/ys/#/article/${data.post_id}`,
      };
    }),
  };
};
