import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "thepaper",
    title: "澎湃新闻",
    type: "热榜",
    link: "https://www.thepaper.cn/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = `https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar`;
  const result = await get({ url, noCache });
  const list = result.data.data.hotNews;
  return {
    ...result,
    data: list.map((v: RouterType["thepaper"]) => ({
      id: v.contId,
      title: v.name,
      cover: v.pic,
      hot: Number(v.praiseTimes),
      timestamp: getTime(v.pubTimeLong),
      url: `https://www.thepaper.cn/newsDetail_forward_${v.contId}`,
      mobileUrl: `https://m.thepaper.cn/newsDetail_forward_${v.contId}`,
    })),
  };
};
