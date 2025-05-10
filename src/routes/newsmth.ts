import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "newsmth",
    title: "水木社区",
    type: "热门话题",
    description: "水木社区是一个源于清华的高知社群。",
    link: "https://www.newsmth.net/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = `https://wap.newsmth.net/wap/api/hot/global`;
  const result = await get({ url, noCache });
  const list = result.data?.data?.topics;
  return {
    ...result,
    data: list.map((v: RouterType["newsmth"]) => {
      const post = v.article;
      const url = `https://wap.newsmth.net/article/${post.topicId}?title=${v.board?.title}&from=home`;
      return {
        id: v.firstArticleId,
        title: post.subject,
        desc: post.body,
        cover: undefined,
        author: post?.account?.name,
        hot: undefined,
        timestamp: getTime(post.postTime),
        url,
        mobileUrl: url,
      };
    }),
  };
};
