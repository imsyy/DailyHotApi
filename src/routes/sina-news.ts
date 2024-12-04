import type { RouterData, ListContext, Options } from "../types.js";
import type { RouterType } from "../router.types.js";
import { getTime, getCurrentDateTime } from "../utils/getTime.js";
import { get } from "../utils/getData.js";

// 榜单类别
const listType = {
  "1": {
    name: "总排行",
    www: "news",
    params: "www_www_all_suda_suda",
  },
  "2": {
    name: "视频排行",
    www: "news",
    params: "video_news_all_by_vv",
  },
  "3": {
    name: "图片排行",
    www: "news",
    params: "total_slide_suda",
  },
  "4": {
    name: "国内新闻",
    www: "news",
    params: "news_china_suda",
  },
  "5": {
    name: "国际新闻",
    www: "news",
    params: "news_world_suda",
  },
  "6": {
    name: "社会新闻",
    www: "news",
    params: "news_society_suda",
  },
  "7": {
    name: "体育新闻",
    www: "sports",
    params: "sports_suda",
  },
  "8": {
    name: "财经新闻",
    www: "finance",
    params: "finance_0_suda",
  },
  "9": {
    name: "娱乐新闻",
    www: "ent",
    params: "ent_suda",
  },
  "10": {
    name: "科技新闻",
    www: "tech",
    params: "tech_news_suda",
  },
  "11": {
    name: "军事新闻",
    www: "news",
    params: "news_mil_suda",
  },
};

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "1";
  const { fromCache, data, updateTime } = await getList({ type }, noCache);
  const routeData: RouterData = {
    name: "sina-news",
    title: "新浪新闻",
    type: listType[type as keyof typeof listType].name,
    params: {
      type: {
        name: "榜单分类",
        type: Object.fromEntries(Object.entries(listType).map(([key, value]) => [key, value.name])),
      },
    },
    link: "https://sinanews.sina.cn/",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

// JSONP 处理
const parseData = (data: string) => {
  // 移除前后多余空白
  if (!data) throw new Error("Input data is empty or invalid");
  // 提取 JSON 字符串部分
  const prefix = "var data = ";
  if (!data.startsWith(prefix))
    throw new Error("Input data does not start with the expected prefix");
  let jsonString = data.slice(prefix.length).trim();
  // 确保字符串以 ';' 结尾并移除它
  if (jsonString.endsWith(";")) {
    jsonString = jsonString.slice(0, -1).trim();
  } else {
    throw new Error("Input data does not end with a semicolon");
  }
  // 格式是否正确
  if (jsonString.startsWith("{") && jsonString.endsWith("}")) {
    // 解析为 JSON 对象
    try {
      const jsonData = JSON.parse(jsonString);
      return jsonData;
    } catch (error) {
      throw new Error("Failed to parse JSON: " + error);
    }
  } else {
    throw new Error("Invalid JSON format");
  }
};

const getList = async (options: Options, noCache: boolean) => {
  const { type } = options;
  // 必要数据
  const { params, www } = listType[type as keyof typeof listType];
  const { year, month, day } = getCurrentDateTime(true);
  const url = `https://top.${www}.sina.com.cn/ws/GetTopDataList.php?top_type=day&top_cat=${params}&top_time=${year + month + day}&top_show_num=50`;
  const result = await get({ url, noCache });
  const list = parseData(result.data).data;
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: list.map((v: RouterType["sina-news"]) => ({
      id: v.id,
      title: v.title,
      author: v.media || undefined,
      hot: parseFloat(v.top_num.replace(/,/g, "")),
      timestamp: getTime(v.create_date + " " + v.create_time),
      url: v.url,
      mobileUrl: v.url,
    })),
  };
};
