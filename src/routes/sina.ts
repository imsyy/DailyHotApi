import type { RouterData, ListContext, Options } from "../types.js";
import type { RouterType } from "../router.types.js";
import { parseChineseNumber } from "../utils/getNum.js";
import { get } from "../utils/getData.js";

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "1";
  const listData = await getList({ type }, noCache);
  const routeData: RouterData = {
    name: "sina",
    title: "新浪网",
    type: "热榜太多，一个就够",
    params: {
      type: {
        name: "榜单分类",
        type: {
          all: "新浪热榜",
          hotcmnt: "热议榜",
          minivideo: "视频热榜",
          ent: "娱乐热榜",
          ai: "AI热榜",
          auto: "汽车热榜",
          mother: "育儿热榜",
          fashion: "时尚热榜",
          travel: "旅游热榜",
          esg: "ESG热榜",
        },
      },
    },
    link: "https://sinanews.sina.cn/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean) => {
  const { type } = options;
  const url = `https://newsapp.sina.cn/api/hotlist?newsId=HB-1-snhs%2Ftop_news_list-${type}`;
  const result = await get({ url, noCache });
  const list = result.data.data.hotList;
  return {
    ...result,
    data: list.map((v: RouterType["sina"]) => {
      const base = v.base;
      const info = v.info;
      return {
        id: base.base.uniqueId,
        title: info.title,
        desc: undefined,
        author: undefined,
        timestamp: undefined,
        hot: parseChineseNumber(info.hotValue),
        url: base.base.url,
        mobileUrl: base.base.url,
      };
    }),
  };
};
