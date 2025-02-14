import type { ListContext, RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";


export const headers =  {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
}

const category_url = 'https://api.juejin.cn/tag_api/v1/query_category_briefs'
const getCategory = async()=>{
  const res = await get({
    url: category_url,
    headers
  })
  const data = res?.data?.data || []
  const typeObj: Record<string, string> = {}
  typeObj['1'] = '综合'
  data.forEach((c: { category_id: string; category_name: string }) => {
    typeObj[c.category_id] = c.category_name
  })

  return typeObj
}

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || 1;
  const listData = await getList(noCache, type);
  const typeMaps =  await getCategory()
  const routeData: RouterData = {
    name: "juejin",
    title: "稀土掘金",
    type: "文章榜",
    params: {
      type: {
        name: "排行榜分区",
        type: typeMaps,
      },
    },
    link: "https://juejin.cn/hot/articles",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean, type: number | string = 1) => {
  const url = `https://api.juejin.cn/content_api/v1/content/article_rank?category_id=${type}&type=hot`;
  const result = await get({ url, noCache, headers });
  const list = result.data.data;
  return {
    ...result,
    data: list.map((v: RouterType["juejin"]) => ({
      id: v.content.content_id,
      title: v.content.title,
      author: v.author.name,
      hot: v.content_counter.hot_rank,
      timestamp: undefined,
      url: `https://juejin.cn/post/${v.content.content_id}`,
      mobileUrl: `https://juejin.cn/post/${v.content.content_id}`,
    })),
  };
};
