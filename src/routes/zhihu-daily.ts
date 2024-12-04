import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "zhihu-daily",
    title: "知乎日报",
    type: "推荐榜",
    description: "每天三次，每次七分钟",
    link: "https://daily.zhihu.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = `https://daily.zhihu.com/api/4/news/latest`;
  const result = await get({
    url,
    noCache,
    headers: {
      Referer: "https://daily.zhihu.com/api/4/news/latest",
      Host: "daily.zhihu.com",
    },
  });
  const list = result.data.stories.filter((el: RouterType["zhihu-daily"]) => el.type === 0);
  return {
    ...result,
    data: list.map((v: RouterType["zhihu-daily"]) => ({
      id: v.id,
      title: v.title,
      cover: v.images?.[0] ?? undefined,
      author: v.hint,
      hot: undefined,
      timestamp: undefined,
      url: v.url,
      mobileUrl: v.url,
    })),
  };
};
