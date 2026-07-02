import type { ListItem, RouterData } from "../types.js";
import { post } from "../utils/getData.js";
import { parseChineseNumber } from "../utils/getNum.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "kuaishou",
    title: "快手",
    type: "热榜",
    description: "快手，拥抱每一种生活",
    link: "https://www.kuaishou.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

interface KuaishouHotItem {
  id: string;
  name: string;
  hotValue?: string | null;
  poster?: string;
  photoIds?: string[];
}

interface KuaishouGraphQLResponse {
  data?: {
    visionHotRank?: {
      items: KuaishouHotItem[];
    };
  };
}

const getList = async (noCache: boolean) => {
  const url = "https://www.kuaishou.com/graphql";
  const body = {
    operationName: "visionHotRank",
    variables: { page: "home" },
    query:
      "query visionHotRank($page: String) { visionHotRank(page: $page) { items { id name hotValue poster photoIds } } }",
  };

  const result = await post<KuaishouGraphQLResponse>({
    url,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Content-Type": "application/json",
      Referer: "https://www.kuaishou.com/",
    },
    body,
    noCache,
  });

  const items = result.data?.data?.visionHotRank?.items || [];
  const listData: ListItem[] = items.map((item: KuaishouHotItem, index: number) => {
    const photoId = item.photoIds?.[0];
    const poster = item.poster ? decodeURIComponent(item.poster) : undefined;
    const videoUrl = photoId
      ? `https://www.kuaishou.com/short-video/${photoId}`
      : `https://www.kuaishou.com/search/video?searchKey=${encodeURIComponent(item.name)}`;
    return {
      id: item.id || index + 1,
      title: item.name,
      cover: poster,
      hot: item.hotValue ? parseChineseNumber(String(item.hotValue)) : 0,
      timestamp: undefined,
      url: videoUrl,
      mobileUrl: videoUrl,
    };
  });

  return {
    ...result,
    data: listData,
  };
};
