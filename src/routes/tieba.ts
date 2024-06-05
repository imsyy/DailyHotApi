import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import getTime from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const { fromCache, data, updateTime } = await getList(noCache);
  const routeData: RouterData = {
    name: "tieba",
    title: "百度贴吧",
    type: "热议榜",
    description: "全球领先的中文社区",
    link: "https://tieba.baidu.com/hottopic/browse/topicList",
    total: data?.length || 0,
    updateTime,
    fromCache,
    data,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const url = `https://tieba.baidu.com/hottopic/browse/topicList`;
  const result = await get({ url, noCache });
  const list = result.data.data.bang_topic.topic_list;
  return {
    fromCache: result.fromCache,
    updateTime: result.updateTime,
    data: list.map((v: RouterType["tieba"]) => ({
      id: v.topic_id,
      title: v.topic_name,
      desc: v.topic_desc,
      cover: v.topic_pic,
      hot: v.discuss_num,
      timestamp: getTime(v.create_time),
      url: v.topic_url,
      mobileUrl: v.topic_url,
    })),
  };
};
