const Router = require("koa-router");

const bilibiliRouter = require("./bilibili");
const zhihuRouter = require("./zhihu");
const baiduRouter = require("./baidu");
const weiboRouter = require("./weibo");
const itHomeRouter = require("./ithome");
const krRouter = require("./36kr");
const sspaiRouter = require("./sspai");
const tiebaRouter = require("./tieba");
const toutiaoRouter = require("./toutiao");
const thepaperRouter = require("./thepaper");
const juejinRouter = require("./juejin");
const newsqqRouter = require("./newsqq");

const router = new Router();

// 根目录
router.get("/", async (ctx) => {
  await ctx.render("index");
});

router.use(bilibiliRouter.routes());
router.use(zhihuRouter.routes());
router.use(baiduRouter.routes());
router.use(weiboRouter.routes());
router.use(itHomeRouter.routes());
router.use(krRouter.routes());
router.use(sspaiRouter.routes());
router.use(tiebaRouter.routes());
router.use(toutiaoRouter.routes());
router.use(thepaperRouter.routes());
router.use(juejinRouter.routes());
router.use(newsqqRouter.routes());

// 404 路由
router.use(async (ctx) => {
  await ctx.render("404");
});

module.exports = router;
