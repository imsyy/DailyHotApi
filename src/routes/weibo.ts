import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "weibo",
    title: "微博",
    type: "热搜榜",
    description: "实时热点，每分钟更新一次",
    link: "https://s.weibo.com/top/summary/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url =
    "https://m.weibo.cn/api/container/getIndex?containerid=106003type%3D25%26t%3D3%26disable_hot%3D1%26filter_type%3Drealtimehot&title=%E5%BE%AE%E5%8D%9A%E7%83%AD%E6%90%9C&extparam=filter_type%3Drealtimehot%26mi_cid%3D100103%26pos%3D0_0%26c_type%3D30%26display_time%3D1540538388&luicode=10000011&lfid=231583";

  const result = await get({
    url,
    noCache,
    ttl: 60,
    headers: {
      Referer: "https://s.weibo.com/top/summary?cate=realtimehot",
      "MWeibo-Pwa": "1",
      "X-Requested-With": "XMLHttpRequest",
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
    },
  });
  const list = result.data.data.cards?.[0]?.card_group;
  return {
    ...result,
    data: list.map((v: RouterType["weibo"]) => {
      const key = v.word_scheme ? v.word_scheme : `#${v.desc}`;
      return {
        id: v.itemid,
        title: v.desc,
        desc: key,
        // author: v.flag_desc,
        timestamp: getTime(v.onboard_time),
        hot: v.desc_extr,
        url: `https://s.weibo.com/weibo?q=${encodeURIComponent(key)}&t=31&band_rank=1&Refer=top`,
        mobileUrl: v?.scheme,
      };
    }),
  };
};
