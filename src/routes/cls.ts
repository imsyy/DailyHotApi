import type { RouterData, RouterResType } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { headers } from "./juejin.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async () => {
  const listData = await getList();
  const routeData: RouterData = {
    name: "clx",
    title: "财联社",
    type: "头条",
    description: "财联社头条",
    link: "https://www.cls.cn/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (): Promise<RouterResType> => {
  const url = "https://www.cls.cn/v3/depth/list/1000?app=CailianpressWeb&id=1000&last_time=&os=web&rn=20&sv=8.4.6&sign=a7aebfb9c660af8779033e0aa8f03a58";
  const result = await get({
    url,
    noCache : false, // 不允许手动刷新
    headers: {
      ...headers,
      Referer: "https://www.cls.cn/depth?id=1000",
      Host: "www.cls.cn",
    },
  });

  const list = result.data.data;
  return {
    ...result,
    data: list.map((v: RouterType["cls"]) => ({
      id: v.id,
      title: v.title,
      cover: v.image || undefined,
      desc: v.brief,
      author: v.source,
      timestamp: getTime(v.ctime),
      hot: Number(v.reading_num),
      url: `https://www.cls.cn/detail/${v.id}`,
      mobileUrl: `https://www.cls.cn/detail/${v.id}`,
    })),
  };
};
