const fs = require("fs");
const path = require("path");
const Router = require("koa-router");

const router = new Router();

// 根目录
router.get("/", async (ctx) => {
  await ctx.render("index");
});

// 遍历所有路由模块
fs.readdirSync(__dirname)
  .filter((filename) => filename.endsWith(".js") && filename !== "index.js")
  .forEach((filename) => {
    const routerPath = path.join(__dirname, filename);
    const routerModule = require(routerPath);
    // 自动注册路由
    if (routerModule instanceof Router) {
      router.use(routerModule.routes());
    }
  });

// 404 路由
router.use(async (ctx) => {
  await ctx.render("404");
});

module.exports = router;
