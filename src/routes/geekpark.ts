import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "geekpark",
    title: "极客公园",
    type: "热门文章",
    description: "极客公园聚焦互联网领域，跟踪新鲜的科技新闻动态，关注极具创新精神的科技产品。",
    link: "https://www.geekpark.net/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = `https://mainssl.geekpark.net/api/v2`;
  const result = await get({ url, noCache });
  const list = result.data?.homepage_posts;
  return {
    ...result,
    data: list.map((v: RouterType["geekpark"]) => {
      const post = v.post;
      return {
        id: post.id,

        title: post.title,
        desc: post.abstract,
        cover: post.cover_url,
        author: post?.authors?.[0]?.nickname,
        hot: post.views,
        timestamp: getTime(post.published_timestamp),
        url: `https://www.geekpark.net/news/${post.id}`,
        mobileUrl: `https://www.geekpark.net/news/${post.id}`,
      };
    }),
  };
};
