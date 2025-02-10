// getTrending.ts
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { ListContext } from "../types";
import logger from "../utils/logger.js";
import {  getCache, setCache } from "../utils/cache.js";

/**
 * 定义 Trending 仓库信息的类型
 */
type RepoInfo = {
  owner: string; // 仓库所属者
  repo: string; // 仓库名称
  url: string; // 仓库链接
  description: string; // 仓库描述
  language: string; // 编程语言
  stars: string; // Stars (由于可能包含逗号或者其他符号，这里先用 string 存；实际可自行转 number)
  forks: string; // Forks
  todayStars?: string | number; // 今日 Star
};

type TrendingRepoInfo = {
  data: RepoInfo[];
  updateTime: string;
  fromCache: boolean;
};

type TrendingType = "daily" | "weekly" | "monthly";

const typeMap: Record<TrendingType, string> = {
  daily: "日榜",
  weekly: "周榜",
  monthly: "月榜",
};

function isTrendingType(value: string): value is TrendingType {
  return ["daily", "weekly", "monthly"].includes(value as TrendingType);
}

export const handleRoute = async (c: ListContext) => {
  const typeParam = c.req.query("type") || "daily";
  const type = isTrendingType(typeParam) ? typeParam : "daily";

  const listData = await getTrendingRepos(type);

  const routeData = {
    name: "github",
    title: "github 趋势",
    type: typeMap[type],
    params: {
      type: {
        name: '排行榜分区',
        type: typeMap,
      },
    },
    link: `https://github.com/trending?since=${type}`,
    total: listData?.data?.length || 0,
    ...{
      ...listData,
      data: listData?.data?.map((v, index)=>{
         return {
          id:index,
          title: v.repo,
          desc: v.description,
          hot: v.stars,
          ...v
         }
      })
    }
  };
  return routeData;
};

/**
 * 爬取 GitHub Trending 列表
 * @param since 可选参数: 'daily' | 'weekly' | 'monthly'，默认值为 'daily'
 * @returns Promise<RepoInfo[]> 返回包含热门项目信息的数组
 */
export async function getTrendingRepos(
  type: TrendingType | string = "daily",
  ttl = 60 * 60 * 24,
): Promise<TrendingRepoInfo> {
  const url = `https://github.com/trending?since=${type}`;
  // 先从缓存中取
  const cachedData = await getCache(url);
  if (cachedData) {
    logger.info("💾 [CHCHE] The request is cached");
    return {
      fromCache: true,
      updateTime: cachedData.updateTime,
      data: (cachedData?.data as RepoInfo[]) || [],
    };
  }
  logger.info(`🌐 [GET] ${url}`);

  // 更新请求头
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
  };

  // 添加重试逻辑
  const maxRetries = 3;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // 设置超时时间为 20 秒
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(url, { 
        headers,
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      // 1. 加载 HTML
      const $ = cheerio.load(html);
      // 2. 存储结果的数组
      const results: RepoInfo[] = [];
      // 3. 遍历每个 article.Box-row
      $("article.Box-row").each((_, el) => {
        const $el = $(el);
        // 仓库标题和链接 (在 <h2> > <a> 里)
        const $repoAnchor = $el.find("h2 a");
        // 可能出现 "owner / repo" 这种文本
        // eg: "owner / repo"
        const fullNameText = $repoAnchor
          .text()
          .trim()
          // 可能有多余空格，可以再做一次 split
          // "owner / repo" => ["owner", "repo"]
          .replace(/\r?\n/g, "") // 去掉换行
          .replace(/\s+/g, " ") // 多空格处理
          .split("/")
          .map((s) => s.trim());

        const owner = fullNameText[0] || "";
        const repoName = fullNameText[1] || "";

        // href 即仓库链接
        const repoUrl = "https://github.com" + $repoAnchor.attr("href");

        // 仓库描述 (<p class="col-9 color-fg-muted ...">)
        const description = $el.find("p.col-9.color-fg-muted").text().trim();

        // 语言 (<span itemprop="programmingLanguage">)
        const language = $el.find('[itemprop="programmingLanguage"]').text().trim();

        const starsText = $el.find('a[href$="/stargazers"]').text().trim();

        const forksText = $el.find(`a[href$="/forks"]`).text().trim();

        // 整合
        results.push({
          owner,
          repo: repoName,
          url: repoUrl || "",
          description,
          language,
          stars: starsText,
          forks: forksText,
        });
      });

      const updateTime = new Date().toISOString();
      const data = results;

      await setCache(url, { data, updateTime }, ttl);
      // 返回数据
      logger.info(`✅ [${response?.status}] 请求成功！`);
      return { fromCache: false, updateTime, data };
    } catch (error: Error | unknown) {
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`❌ [ERROR] 第 ${i + 1} 请求失败: ${errorMessage}`);
      
      // 如果是最后一次重试，则抛出错误
      if (i === maxRetries - 1) {
        logger.error("❌ [ERROR] 所有尝试请求失败！");
        throw lastError;
      }
      
      // 等待一段时间后重试 (1秒、2秒、4秒...)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      continue;
    }
  }
  
  throw new Error("请求失败！");
}
