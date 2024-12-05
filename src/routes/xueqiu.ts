import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "xueqiu",
    title: "雪球",
    type: "热门话题",
    description: "聪明的投资者都在这里",
    link: "https://xueqiu.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = `https://xueqiu.com/hot_event/list.json`;
  const result = await get({
    url,
    noCache,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/605.1.15",
    },
  });
  const list = result.data.list;
  return {
    ...result,
    data: list.map((v: RouterType["xueqiu"]) => ({
      id: v.id,
      title: v.tag?.startsWith("#") && v.tag?.endsWith("#") ? v.tag.slice(1, -1) : v.tag,
      desc: v.content,
      cover: v.pic,
      author: undefined,
      hot: v.hot,
      timestamp: undefined,
      url: undefined,
      mobileUrl: undefined,
    })),
  };
};
