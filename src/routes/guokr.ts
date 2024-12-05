import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "guokr",
    title: "果壳",
    type: "热门文章",
    description: "科技有意思",
    link: "https://www.guokr.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = `https://www.guokr.com/beta/proxy/science_api/articles?limit=30`;
  const result = await get({
    url,
    noCache,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
    },
  });
  const list = result.data;
  return {
    ...result,
    data: list.map((v: RouterType["guokr"]) => ({
      id: v.id,
      title: v.title,
      desc: v.summary,
      cover: v.small_image,
      author: v.author?.nickname,
      hot: undefined,
      timestamp: getTime(v.date_modified),
      url: `https://www.guokr.com/article/${v.id}`,
      mobileUrl: `https://m.guokr.com/article/${v.id}`,
    })),
  };
};
