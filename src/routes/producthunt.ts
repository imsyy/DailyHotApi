import type { RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { load } from "cheerio";
import type { RouterType } from "../router.types.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "producthunt",
    title: "Product Hunt",
    type: "Today",
    description: "The best new products, every day",
    link: "https://www.producthunt.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const baseUrl = "https://www.producthunt.com";
  const result = await get({ 
    url: baseUrl,
    noCache,
    headers: {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
  });

  try {
    const $ = load(result.data);
    const stories: RouterType["producthunt"][] = [];

    $("[data-test=homepage-section-0] [data-test^=post-item]").each((_, el) => {
      const a = $(el).find("a").first();
      const path = a.attr("href");
      const title = $(el).find("a[data-test^=post-name]").text().trim();
      const id = $(el).attr("data-test")?.replace("post-item-", "");
      const vote = $(el).find("[data-test=vote-button]").text().trim();
      
      if (path && id && title) {
        stories.push({
          id,
          title,
          hot: parseInt(vote) || undefined,
          timestamp: undefined,
          url: `${baseUrl}${path}`,
          mobileUrl: `${baseUrl}${path}`,
        });
      }
    });

    return {
      ...result,
      data: stories,
    };
  } catch (error) {
    throw new Error(`Failed to parse Product Hunt HTML: ${error}`);
  }
}; 