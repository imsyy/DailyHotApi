import type { RouterData, ListContext, Options, RouterResType } from "../types.js";
import type { RouterType } from "../router.types.js";
import { post } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

const typeMap: Record<string, string> = {
  hot: "人气榜",
  video: "视频榜",
  comment: "热议榜",
  collect: "收藏榜",
};

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "hot";
  const listData = await getList({ type }, noCache);
  const routeData: RouterData = {
    name: "36kr",
    title: "36氪",
    type: typeMap[type],
    params: {
      type: {
        name: "热榜分类",
        type: typeMap,
      },
    },
    link: "https://m.36kr.com/hot-list-m",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean): Promise<RouterResType> => {
  const { type } = options;
  const url = `https://gateway.36kr.com/api/mis/nav/home/nav/rank/${type}`;
  const result = await post({
    url,
    noCache,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: {
      partner_id: "wap",
      param: {
        siteId: 1,
        platformId: 2,
      },
      timestamp: new Date().getTime(),
    },
  });
  const listType = {
    hot: "hotRankList",
    video: "videoList",
    comment: "remarkList",
    collect: "collectList",
  };
  const list =
    result.data.data[(listType as Record<string, keyof typeof result.data.data>)[type || "hot"]];
  return {
    ...result,
    data: list.map((v: RouterType["36kr"]) => {
      const item = v.templateMaterial;
      return {
        id: v.itemId,
        title: item.widgetTitle,
        cover: item.widgetImage,
        author: item.authorName,
        timestamp: getTime(v.publishTime),
        hot: item.statCollect || undefined,
        url: `https://www.36kr.com/p/${v.itemId}`,
        mobileUrl: `https://m.36kr.com/p/${v.itemId}`,
      };
    }),
  };
};
