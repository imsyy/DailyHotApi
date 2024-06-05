import { serve } from "@hono/node-server";
import { config } from "./config.js";
import logger from "./utils/logger.js";
import app from "./app.js";

// 启动服务器
const serveHotApi = (port: number = config.PORT) => {
  try {
    const apiServer = serve({
      fetch: app.fetch,
      port,
    });
    logger.info(`🔥 DailyHot API 成功在端口 ${config.PORT} 上运行`);
    logger.info(`🔗 Local: 👉 http://localhost:${config.PORT}`);
    return apiServer;
  } catch (error) {
    logger.error(error);
  }
};

serveHotApi();

export default serveHotApi;
