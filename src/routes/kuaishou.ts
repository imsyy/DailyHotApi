import type { RouterType } from "../router.types.js";
import type { ListItem, RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { parseChineseNumber } from "../utils/getNum.js";
import UserAgent from "user-agents";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "kuaishou",
    title: "快手",
    type: "热榜",
    description: "快手，拥抱每一种生活",
    link: "https://www.kuaishou.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = `https://www.kuaishou.com/?isHome=1`;
  const userAgent = new UserAgent({
    deviceCategory: "desktop",
  });
  const result = await get({
    url,
    noCache,
    headers: {
      "User-Agent": userAgent.toString(),
    },
  });
  const listData: ListItem[] = [];
  // 获取主要内容
  const pattern = /window.__APOLLO_STATE__=(.*);\(function\(\)/s;
  const matchResult = result.data?.match(pattern);
  const jsonObject = JSON.parse(matchResult[1])["defaultClient"];
  // 获取所有分类
  const allItems = jsonObject['$ROOT_QUERY.visionHotRank({"page":"home"})']["items"];
  // 获取全部热榜
  allItems?.forEach((item: { id: string }) => {
    // 基础数据
    const hotItem: RouterType["kuaishou"] = jsonObject[item.id];
    const id = hotItem.photoIds?.json?.[0];
    listData.push({
      id: hotItem.id,
      title: hotItem.name,
      cover: decodeURIComponent(hotItem.poster),
      hot: parseChineseNumber(hotItem.hotValue),
      timestamp: undefined,
      url: `https://www.kuaishou.com/short-video/${id}`,
      mobileUrl: `https://www.kuaishou.com/short-video/${id}`,
    });
  });
  return {
    ...result,
    data: listData,
  };
};
