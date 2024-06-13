import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const { fromCache, data, updateTime } = await getList(noCache);
  const routeData: RouterData = {
    name: "zhihu",
    title: "知乎",
    type: "热榜",
    link: "https://www.zhihu.com/hot",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = `https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=50&desktop=true`;
  const result = await get({ url, noCache });
  const list = result.data.data;
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: list.map((v: RouterType["zhihu"]) => {
      const data = v.target;
      return {
        id: data.id,
        title: data.title,
        desc: data.excerpt,
        cover: v.children[0].thumbnail,
        timestamp: getTime(data.created),
        hot: parseInt(v.detail_text.replace(/[^\d]/g, "")) * 10000,
        url: `https://www.zhihu.com/question/${data.id}`,
        mobileUrl: `https://www.zhihu.com/question/${data.id}`,
      };
    }),
  };
};
