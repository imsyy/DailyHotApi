process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const { fromCache, data, updateTime } = await getList(noCache);
  const routeData: RouterData = {
    name: "zhihu-daily",
    title: "知乎日报",
    type: "推荐榜",
    description: "每天三次，每次七分钟",
    link: "https://daily.zhihu.com/",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = `https://news-at.zhihu.com/api/4/news/latest`;
  const result = await get({
    url,
    noCache,
    headers: {
      Referer: "https://news-at.zhihu.com/api/4/news/latest",
      Host: "news-at.zhihu.com",
    },
  });
  const list = result.data.stories.filter((el: RouterType["zhihu-daily"]) => el.type === 0);
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: list.map((v: RouterType["zhihu-daily"]) => ({
      id: v.id,
      title: v.title,
      cover: v.images[0],
      author: v.hint,
      url: v.url,
      mobileUrl: v.url,
    })),
  };
};
