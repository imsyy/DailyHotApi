import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";
import { config } from "../config.js"

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "zhihu",
    title: "知乎",
    type: "热榜",
    link: "https://www.zhihu.com/hot",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = `https://api.zhihu.com/topstory/hot-lists/total?limit=50`;
  const result = await get({ 
      url,
      noCache,
      ...(config.ZHIHU_COOKIE && {
        headers: {
          Cookie: config.ZHIHU_COOKIE
        }
      })
    });
  const list = result.data.data;
  return {
    ...result,
    data: list.map((v: RouterType["zhihu"]) => {
      const data = v.target;
      const questionId = data.url.split("/").pop();
      return {
        id: data.id,
        title: data.title,
        desc: data.excerpt,
        cover: v.children[0].thumbnail,
        timestamp: getTime(data.created),
        hot: parseFloat(v.detail_text.split(" ")[0]) * 10000,
        url: `https://www.zhihu.com/question/${questionId}`,
        mobileUrl: `https://www.zhihu.com/question/${questionId}`,
      };
    }),
  };
};
