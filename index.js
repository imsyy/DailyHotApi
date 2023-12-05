require("dotenv").config();
const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const cors = require("koa2-cors");
const serve = require("koa-static");
const views = require("koa-views");
const winston = require("winston");
const path = require("path");

const app = new Koa();
const net = require("net");
const router = require("./routes");
const { createLogger, format, transports } = winston;

// 配置信息
let domain = process.env.ALLOWED_DOMAIN || "*";
let port = process.env.PORT || 6688;

// 配置 log
const log = createLogger({
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level}] ${message}`),
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(__dirname, "logs", "app.log"),
      maxsize: 2 * 1024 * 1024,
    }),
  ],
});

// 重新定义 console
console.log = (...args) => {
  log.info(args.join(" "));
};
console.info = (...args) => {
  log.info(args.join(" "));
};
console.warn = (...args) => {
  log.warn(args.join(" "));
};
console.error = (...args) => {
  log.error(args.join(" "));
};

// 解析请求体
app.use(bodyParser());

// 静态文件目录
app.use(serve(__dirname + "/public"));
app.use(views(__dirname + "/public"));

// 跨域
app.use(
  cors({
    origin: domain,
  }),
);

app.use(async (ctx, next) => {
  if (domain === "*") {
    await next();
  } else {
    if (ctx.headers.origin === domain || ctx.headers.referer === domain) {
      await next();
    } else {
      ctx.status = 403;
      ctx.body = {
        code: 403,
        message: "请通过正确的域名访问",
      };
    }
  }
});

// 使用路由中间件
app.use(router.routes());
app.use(router.allowedMethods());

// 启动应用程序并监听端口
const startApp = (port) => {
  app.listen(port, () => {
    log.info(`成功在 ${port} 端口上运行`);
  });
};

// 检测端口是否被占用
const checkPort = (port) => {
  return new Promise((resolve, reject) => {
    const server = net
      .createServer()
      .once("error", (err) => {
        if (err.code === "EADDRINUSE") {
          log.info(`端口 ${port} 已被占用, 正在尝试其他端口...`);
          server.close();
          resolve(false);
        } else {
          reject(err);
        }
      })
      .once("listening", () => {
        server.close();
        resolve(true);
      })
      .listen(port);
  });
};

// 尝试启动应用程序
const tryStartApp = async (port) => {
  let isPortAvailable = await checkPort(port);
  while (!isPortAvailable) {
    port++;
    isPortAvailable = await checkPort(port);
  }
  startApp(port);
};

tryStartApp(port);
