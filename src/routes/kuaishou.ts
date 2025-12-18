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
  const html = result.data || "";
  const start = html.indexOf("window.__APOLLO_STATE__=");
  if (start === -1) {
    throw new Error("快手页面结构变更，未找到 APOLLO_STATE");
  }
  const scriptSlice = html.slice(start + "window.__APOLLO_STATE__=".length);
  const sentinelA = scriptSlice.indexOf(";(function(");
  const sentinelB = scriptSlice.indexOf("</script>");
  const cutIndex =
    sentinelA !== -1 && sentinelB !== -1 ? Math.min(sentinelA, sentinelB) : Math.max(sentinelA, sentinelB);
  if (cutIndex === -1) {
    throw new Error("快手页面结构变更，未找到 APOLLO_STATE 结束标记");
  }
  const raw = scriptSlice.slice(0, cutIndex).trim().replace(/;$/, "");
  let jsonObject;
  try {
    // 快手返回的 JSON 末尾常带 undefined/null，需要截断到最后一个 '}' 出现
    const lastBrace = raw.lastIndexOf("}");
    const cleanRaw = lastBrace !== -1 ? raw.slice(0, lastBrace + 1) : raw;
    jsonObject = JSON.parse(cleanRaw)["defaultClient"];
  } catch (err) {
    const msg =
      err instanceof Error
        ? `${err.message} | snippet=${raw.slice(0, 200)}...`
        : "未知错误";
    throw new Error(`快手数据解析失败: ${msg}`);
  }
  // 获取所有分类
  const allItems =
    jsonObject['$ROOT_QUERY.visionHotRank({"page":"home"})']?.items ||
    jsonObject['$ROOT_QUERY.visionHotRank({"page":"home","platform":"web"})']
      ?.items ||
    [];
  // 获取全部热榜
  allItems?.forEach((item: { id: string }) => {
    // 基础数据
    const hotItem: RouterType["kuaishou"] = jsonObject[item.id];
    if (!hotItem) return;
    const id = hotItem.photoIds?.json?.[0];
    const hotValue = hotItem.hotValue ?? "";
    const poster = hotItem.poster ? decodeURIComponent(hotItem.poster) : undefined;
    listData.push({
      id: hotItem.id,
      title: hotItem.name,
      cover: poster,
      hot: parseChineseNumber(String(hotValue)),
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
