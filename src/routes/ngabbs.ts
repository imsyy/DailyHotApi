import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { post } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const { fromCache, data, updateTime } = await getList(noCache);
  const routeData: RouterData = {
    name: "ngabbs",
    title: "NGA",
    type: "论坛热帖",
    description: "精英玩家俱乐部",
    link: "https://ngabbs.com/",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = `https://ngabbs.com/nuke.php?__lib=load_topic&__act=load_topic_reply_ladder2&opt=1&all=1`;
  const result = await post({
    url,
    noCache,
    headers: {
      Accept: "*/*",
      Host: "ngabbs.com",
      Referer: "https://ngabbs.com/",
      Connection: "keep-alive",
      "Content-Length": "11",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-Hans-CN;q=1",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
      "X-User-Agent": "NGA_skull/7.3.1(iPhone13,2;iOS 17.2.1)",
    },
    body: {
      __output: "14",
    },
  });
  const list = result.data.result[0];
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: list.map((v: RouterType["ngabbs"]) => ({
      id: v.tid,
      title: v.subject,
      author: v.author,
      hot: v.replies,
      timestamp: getTime(v.postdate),
      url: `https://bbs.nga.cn${v.tpcurl}`,
      mobileUrl: `https://bbs.nga.cn${v.tpcurl}`,
    })),
  };
};
