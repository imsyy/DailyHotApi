import type { RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

interface Topic {
  id: number;
  title: string;
  excerpt: string;
  last_poster_username: string;
  created_at: string;
  views: number;
  like_count: number;
}

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "linuxdo",
    title: "Linux.do",
    type: "热门文章",
    description: "Linux 技术社区热搜",
    link: "https://linux.do/hot",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = "https://linux.do/top/weekly.json";
  const result = await get({
    url,
    noCache,
    headers: {
      "Accept": "application/json",
    }
  });
  
  const topics = result.data.topic_list.topics as Topic[];
  const list = topics.map((topic) => {
    return {
      id: topic.id,
      title: topic.title,
      desc: topic.excerpt,
      author: topic.last_poster_username,
      timestamp: getTime(topic.created_at),
      url: `https://linux.do/t/${topic.id}`,
      mobileUrl: `https://linux.do/t/${topic.id}`,
      hot: topic.views || topic.like_count
    };
  });

  return {
    ...result,
    data: list
  };
}; 