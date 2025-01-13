import type { RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { load } from "cheerio";
import type { RouterType } from "../router.types.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "github",
    title: "GitHub",
    type: "Trending",
    description: "See what the GitHub community is most excited about today",
    link: "https://github.com/trending",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  const baseUrl = "https://github.com";
  const result = await get({ 
    url: `${baseUrl}/trending?spoken_language_code=`,
    noCache,
    headers: {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
  });

  try {
    const $ = load(result.data);
    const stories: RouterType["github"][] = [];

    $("main .Box div[data-hpc] > article").each((_, el) => {
      const a = $(el).find(">h2 a");
      const title = a.text().replace(/\n+/g, "").trim();
      const path = a.attr("href");
      const star = $(el).find("[href$=stargazers]").text().replace(/\s+/g, "").trim();
      const desc = $(el).find(">p").text().replace(/\n+/g, "").trim();
      
      if (path && title) {
        stories.push({
          id: path.slice(1), // 移除开头的 /
          title,
          desc,
          hot: parseInt(star.replace(/,/g, "")) || undefined,
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
    throw new Error(`Failed to parse GitHub Trending HTML: ${error}`);
  }
}; 