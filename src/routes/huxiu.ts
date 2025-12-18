import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { getTime } from "../utils/getTime.js";
import axios from "axios";

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
  // PC 端接口
  const url = `https://moment-api.huxiu.com/web-v3/moment/feed?platform=www`;
  const res = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Referer: "https://www.huxiu.com/moment/",
    },
    timeout: 10000,
  });
  const list: RouterType["huxiu"][] = res.data?.data?.moment_list?.datalist || [];
  return {
    fromCache: false,
    updateTime: res.data?.data?.moment_list?.last_id
      ? getTime(res.data.data.moment_list.last_id)
      : undefined,
    data: list.map((v: RouterType["huxiu"]) => {
      const content = (v.content || "").replace(/<br\s*\/?>/gi, "\n");
      const [titleLine, ...rest] = content
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const title = titleLine?.replace(/。$/, "") || "";
      const intro = rest.join("\n");
      const momentId = v.object_id;
      return {
        id: momentId,
        title,
        desc: intro,
        author: v.user_info?.username || "",
        timestamp: getTime(v.publish_time),
        hot: v.count_info?.agree_num,
        url: `https://www.huxiu.com/moment/${momentId}.html`,
        mobileUrl: `https://m.huxiu.com/moment/${momentId}.html`,
      };
    }),
  };
};
