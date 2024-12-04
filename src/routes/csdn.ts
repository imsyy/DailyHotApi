import type { RouterData, RouterResType } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const { fromCache, data, updateTime } = await getList(noCache);
  const routeData: RouterData = {
    name: "csdn",
    title: "CSDN",
    type: "排行榜",
    description: "专业开发者社区",
    link: "https://www.csdn.net/",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

const getList = async (noCache: boolean): Promise<RouterResType> => {
  const url = "https://blog.csdn.net/phoenix/web/blog/hot-rank?page=0&pageSize=30";
  const result = await get({ url, noCache });
  const list = result.data.data;
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: list.map((v: RouterType["csdn"]) => ({
      id: v.productId,
      title: v.articleTitle,
      cover: v.picList?.[0] || undefined,
      desc: undefined,
      author: v.nickName,
      timestamp: getTime(v.period),
      hot: Number(v.hotRankScore),
      url: v.articleDetailUrl,
      mobileUrl: v.articleDetailUrl,
    })),
  };
};
