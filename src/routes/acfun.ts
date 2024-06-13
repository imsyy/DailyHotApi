import type { RouterData, ListContext, Options } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "-1";
  const range = c.req.query("range") || "DAY";
  const { fromCache, data, updateTime } = await getList({ type, range }, noCache);
  const routeData: RouterData = {
    name: "acfun",
    title: "AcFun",
    type: "排行榜",
    description: "AcFun是一家弹幕视频网站，致力于为每一个人带来欢乐。",
    parame: {
      type: {
        name: "频道",
        type: {
          "-1": "全站综合",
          "155": "番剧",
          "1": "动画",
          "60": "娱乐",
          "201": "生活",
          "58": "音乐",
          "123": "舞蹈·偶像",
          "59": "游戏",
          "70": "科技",
          "68": "影视",
          "69": "体育",
          "125": "鱼塘",
        },
      },
      range: {
        name: "时间",
        type: {
          DAY: "今日",
          THREE_DAYS: "三日",
          WEEK: "本周",
        },
      },
    },
    link: "https://www.acfun.cn/rank/list/",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean) => {
  const { type, range } = options;
  const url = `https://www.acfun.cn/rest/pc-direct/rank/channel?channelId=${type === "-1" ? "" : type}&rankLimit=30&rankPeriod=${range}`;
  const result = await get({
    url,
    headers: {
      Referer: `https://www.acfun.cn/rank/list/?cid=-1&pcid=${type}&range=${range}`,
    },
    noCache,
  });
  const list = result.data.rankList;
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: list.map((v: RouterType["acfun"]) => ({
      id: v.dougaId,
      title: v.contentTitle,
      desc: v.contentDesc,
      cover: v.coverUrl,
      author: v.userName,
      timestamp: getTime(v.contributeTime),
      hot: v.likeCount,
      url: `https://www.acfun.cn/v/ac${v.dougaId}`,
      mobileUrl: `https://m.acfun.cn/v/?ac=${v.dougaId}`,
    })),
  };
};
