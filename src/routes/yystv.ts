import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "yystv",
    title: "游研社",
    type: "全部文章",
    description:
      "游研社是以游戏内容为主的新媒体，出品内容包括大量游戏、动漫有关的研究文章和社长聊街机、社长说、游研剧场、老四强等系列视频内容。",
    link: "https://www.yystv.cn/docs",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = "https://www.yystv.cn/home/get_home_docs_by_page";
  const result = await get({ url, noCache });
  const list = result.data.data;
  return {
    ...result,
    data: list.map((v: RouterType["yystv"]) => ({
      id: v.id,
      title: v.title,
      cover: v.cover,
      author: v.author,
      hot: undefined,
      timestamp: getTime(v.createtime),
      url: `https://www.yystv.cn/p/${v.id}`,
      mobileUrl: `https://www.yystv.cn/p/${v.id}`,
    })),
  };
};
