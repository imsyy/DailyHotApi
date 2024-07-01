import type { RouterData, ListContext, Options } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const province = c.req.query("province") || "";
  const { fromCache, data, type, updateTime } = await getList({ province }, noCache);
  const routeData: RouterData = {
    name: "weatheralarm",
    title: "中央气象台",
    type: type || "全国气象预警",
    params: {
      province: {
        name: "预警区域",
        value: "省份名称（ 例如：广东省 ）",
      },
    },
    link: "http://nmc.cn/publish/alarm.html",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean) => {
  const { province } = options;
  const url = `http://www.nmc.cn/rest/findAlarm?pageNo=1&pageSize=20&signaltype=&signallevel=&province=${encodeURIComponent(province)}`;
  const result = await get({ url, noCache });
  const list = result.data.data.page.list;
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    type: province + "气象预警",
    data: list.map((v: RouterType["weatheralarm"]) => ({
      id: v.alertid,
      title: v.title,
      desc: v.issuetime + " " + v.title,
      cover: v.pic,
      timestamp: getTime(v.issuetime),
      hot: null,
      url: `http://nmc.cn${v.url}`,
      mobileUrl: `http://nmc.cn${v.url}`,
    })),
  };
};
