import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "huxiu",
    title: "虎嗅",
    type: "24小时",
    link: "https://www.huxiu.com/moment/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  // 使用移动端页面，数据通过 window.__NUXT__ 内联
  const url = `https://m.huxiu.com/moment/`;
  const result = await get({
    url,
    noCache,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
      Referer: "https://m.huxiu.com/moment/",
    },
    responseType: "text",
  });
  // 正则查找内联的 NUxt 数据
  const pattern = /window.__NUXT__=(.*?);<\/script>/s;
  const matchResult = result.data.match(pattern);
  if (!matchResult || !matchResult[1]) {
    throw new Error("虎嗅页面结构变更，未找到内联数据");
  }
  const expr = matchResult[1].trim();
  let nuxtData: any;
  try {
    // 直接求值表达式 (function(...){return {...}})(...)
    // eslint-disable-next-line no-eval
    nuxtData = eval(expr);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "未知错误";
    throw new Error(`虎嗅数据解析失败: ${msg}`);
  }
  const list = nuxtData?.data?.[0]?.momentList || [];
  return {
    ...result,
    data: list.map((v: RouterType["huxiu"]) => {
      const content = (v.content || "").replace(/<br\s*\/?>/gi, "\n");
      const [titleLine, ...rest] = content
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const title = titleLine?.replace(/。$/, "") || "";
      const intro = rest.join("\n");
      const momentId = v.moment_id || v.object_id;
      return {
        id: momentId,
        title,
        desc: intro,
        author: v.user_info?.username || "",
        timestamp: getTime(v.origin_publish_time || v.publish_time),
        hot: undefined,
        url: v.url || `https://www.huxiu.com/moment/${momentId}.html`,
        mobileUrl: v.url || `https://m.huxiu.com/moment/${momentId}.html`,
      };
    }),
  };
};
