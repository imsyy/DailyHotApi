const fs = require("fs");
const path = require("path");
const Router = require("koa-router");

const router = new Router();

// 全部路由数据
const allRouterInfo = {
  name: "全部接口",
  subtitle: "除了特殊接口外的全部接口列表",
  total: 0,
  data: [],
};

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
      // 写入路由数据
      if (routerModule?.info) {
        allRouterInfo.total++;
        allRouterInfo.data.push({
          ...routerModule.info,
          stack: routerModule.stack,
        });
      }
      // 引用路由
      router.use(routerModule.routes());
    }
  });

// 全部接口路由
router.get("/all", async (ctx) => {
  console.log("获取全部接口路由");
  if (allRouterInfo.total > 0) {
    ctx.body = {
      code: 200,
      message: "获取成功",
      ...allRouterInfo,
    };
  } else if (allRouterInfo.total === 0) {
    ctx.body = {
      code: 200,
      message: "暂无接口，请添加",
      ...allRouterInfo,
    };
  } else {
    ctx.body = {
      code: 500,
      message: "获取失败",
      ...allRouterInfo,
    };
  }
});

// 404 路由
router.use(async (ctx) => {
  await ctx.render("404");
});

module.exports = router;
