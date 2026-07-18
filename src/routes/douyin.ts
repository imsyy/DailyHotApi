import type { RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "douyin",
    title: "抖音",
    type: "热榜",
    description: "实时上升热点",
    link: "https://www.douyin.com",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

interface DouyinWordItem {
  sentence_id: string;
  word: string;
  event_time: string;
  hot_value: number;
}

interface DouyinResponse {
  status_code: number;
  status_msg?: string;
  data?: {
    word_list?: DouyinWordItem[];
  };
}

const getList = async (noCache: boolean) => {
  const url =
    "https://www.douyin.com/aweme/v1/web/hot/search/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&detail_list=1";
  const result = await get<DouyinResponse>({
    url,
    noCache,
    headers: {
      Cookie: `passport_csrf_token=${crypto.randomUUID()}`,
    },
  });
  const responseData = result.data;
  if (!responseData) {
    throw new Error("获取抖音热榜失败: 响应数据为空");
  }
  if (responseData.status_code !== 0) {
    const reason = responseData.status_msg || `status_code=${responseData.status_code}`;
    throw new Error(`获取抖音热榜失败: ${reason}`);
  }
  const list = responseData.data?.word_list;
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("获取抖音热榜失败: word_list 缺失或为空");
  }
  return {
    ...result,
    data: list.map((v) => ({
      id: v.sentence_id,
      title: v.word,
      timestamp: getTime(v.event_time),
      hot: v.hot_value,
      url: `https://www.douyin.com/hot/${v.sentence_id}`,
      mobileUrl: `https://www.douyin.com/hot/${v.sentence_id}`,
    })),
  };
};
