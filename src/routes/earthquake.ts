import type { RouterData, ListContext, Options } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

const mappings = {
  O_TIME: "发震时刻(UTC+8)",
  LOCATION_C: "参考位置",
  M: "震级(M)",
  EPI_LAT: "纬度(°)",
  EPI_LON: "经度(°)",
  EPI_DEPTH: "深度(千米)",
  SAVE_TIME: "录入时间",
};

const typeMappings = {
  1: "最近24小时地震信息",
  2: "最近48小时地震信息",
  3: "最近7天地震信息",
  4: "最近30天地震信息",
  5: "最近一年3.0级以上地震信息",
  6: "最近一年地震信息",
  7: "最近一年3.0级以下地震",
  8: "最近一年4.0级以上地震信息",
  9: "最近一年5.0级以上地震信息",
  0: "最近一年6.0级以上地震信息",
};

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "5";
  const { fromCache, data, updateTime } = await getList({ type }, noCache);
  const routeData: RouterData = {
    name: "earthquake",
    title: "中国地震台",
    type: "地震速报",
    params: {
      type: {
        name: "速报分类",
        type: {
          ...typeMappings,
        },
      },
    },
    link: "https://news.ceic.ac.cn/",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean) => {
  const { type } = options;
  const url = `http://www.ceic.ac.cn/ajax/speedsearch?num=${type}`;
  const result = await get({ url, noCache });
  const data = result.data.replace(/,"page":"(.*?)","num":/, ',"num":');
  const list = JSON.parse(data.substring(1, data.length - 1)).shuju;
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: list.map((v: RouterType["earthquake"]) => {
      const contentBuilder = [];
      const { NEW_DID, LOCATION_C, M } = v;
      for (const mappingsKey in mappings) {
        contentBuilder.push(`${mappings[mappingsKey]}：${v[mappingsKey]}`);
      }
      return {
        id: NEW_DID,
        title: `${LOCATION_C}发生${M}级地震`,
        desc: contentBuilder.join("\n"),
        timestamp: getTime(v["O_TIME"]),
        hot: null,
        url: `https://news.ceic.ac.cn/${NEW_DID}.html`,
        mobileUrl: `https://news.ceic.ac.cn/${NEW_DID}.html`,
      };
    }),
  };
};
