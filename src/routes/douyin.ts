import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import getTime from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const { fromCache, data, updateTime } = await getList(noCache);
  const routeData: RouterData = {
    name: "douyin",
    title: "抖音",
    type: "热榜",
    description: "实时上升热点",
    link: "https://www.douyin.com",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

// 获取抖音临时 Cookis
const getDyCookies = async () => {
  try {
    const cookisUrl = "https://www.douyin.com/passport/general/login_guiding_strategy/?aid=6383";
    const { data } = await get({ url: cookisUrl, originaInfo: true });
    const pattern = /passport_csrf_token=(.*); Path/s;
    const matchResult = data.headers["set-cookie"][0].match(pattern);
    const cookieData = matchResult[1];
    return cookieData;
  } catch (error) {
    console.error("获取抖音 Cookie 出错" + error);
    return null;
  }
};

const getList = async (noCache: boolean) => {
  const url =
    "https://www.douyin.com/aweme/v1/web/hot/search/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&detail_list=1";
  const cookie = await getDyCookies();
  const result = await get({
    url,
    noCache,
    headers: {
      Cookie: `passport_csrf_token=${cookie}`,
    },
  });
  const list = result.data.data.word_list;
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: list.map((v: RouterType["douyin"]) => ({
      id: v.sentence_id,
      title: v.word,
      timestamp: getTime(v.event_time),
      hot: v.hot_value,
      url: `https://www.douyin.com/hot/${encodeURIComponent(v.sentence_id)}`,
      mobileUrl: `https://www.douyin.com/hot/${encodeURIComponent(v.sentence_id)}`,
    })),
  };
};
