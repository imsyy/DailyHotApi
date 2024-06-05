import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import getTime from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const { fromCache, data, updateTime } = await getList(noCache);
  const routeData: RouterData = {
    name: "huxiu",
    title: "虎嗅",
    type: "24小时",
    link: "https://www.huxiu.com/moment/",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

// 标题处理
const titleProcessing = (text: string) => {
  const paragraphs = text.split("<br><br>");
  const title = paragraphs.shift().replace(/。$/, "");
  const intro = paragraphs.join("<br><br>");
  return { title, intro };
};

const getList = async (noCache: boolean) => {
  const url = `https://www.huxiu.com/moment/`;
  const result = await get({
    url,
    noCache,
  });
  // 正则查找
  const pattern =
    /<script>[\s\S]*?window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});[\s\S]*?<\/script>/;
  const matchResult = result.data.match(pattern);
  const jsonObject = JSON.parse(matchResult[1]).moment.momentList.moment_list.datalist;
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: jsonObject.map((v: RouterType["huxiu"]) => ({
      id: v.object_id,
      title: titleProcessing(v.content).title,
      desc: titleProcessing(v.content).intro,
      author: v.user_info.username,
      timestamp: getTime(v.publish_time),
      hot: null,
      url: v.url || "https://www.huxiu.com/moment/",
      mobileUrl: v.url || "https://m.huxiu.com/moment/",
    })),
  };
};
