import type { RouterData, ListContext, Options, RouterResType } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

// 游戏分类
const gameMap: Record<string, string> = {
  "1": "崩坏3",
  "2": "原神",
  "3": "崩坏学园2",
  "4": "未定事件簿",
  "5": "大别野",
  "6": "崩坏：星穹铁道",
  "7": "暂无",
  "8": "绝区零",
};

// 榜单分类
const typeMap: Record<string, string> = {
  "1": "公告",
  "2": "活动",
  "3": "资讯",
};

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const game = c.req.query("game") || "1";
  const type = c.req.query("type") || "1";
  const listData = await getList({ game, type }, noCache);
  const routeData: RouterData = {
    name: "miyoushe",
    title: `米游社 · ${gameMap[game]}`,
    type: `最新${typeMap[type]}`,
    params: {
      game: {
        name: "游戏分类",
        type: gameMap,
      },
      type: {
        name: "榜单分类",
        type: typeMap,
      },
    },
    link: "https://www.miyoushe.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean): Promise<RouterResType> => {
  const { game, type } = options;
  const url = `https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?client_type=4&gids=${game}&last_id=&page_size=30&type=${type}`;
  const result = await get({ url, noCache });
  const list = result.data.data.list;
  return {
    ...result,
    data: list.map((v: RouterType["miyoushe"]) => {
      const data = v.post;
      return {
        id: data.post_id,
        title: data.subject,
        desc: data.content,
        cover: data.cover || data?.images?.[0],
        author: v.user?.nickname || undefined,
        timestamp: getTime(data.created_at),
        hot: data.view_status || 0,
        url: `https://www.miyoushe.com/ys/article/${data.post_id}`,
        mobileUrl: `https://m.miyoushe.com/ys/#/article/${data.post_id}`,
      };
    }),
  };
};
