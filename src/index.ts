import { serve } from "@hono/node-server";
import { config } from "./config.js";
import logger from "./utils/logger.js";
import app from "./app.js";

// 启动服务器
const server = serve({
  fetch: app.fetch,
  port: config.PORT,
});

logger.info(`🔥 DailyHot API 成功在端口 ${config.PORT} 上运行`);
logger.info(`🔗 Local: 👉 http://localhost:${config.PORT}`);

export default server;
