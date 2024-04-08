import type { Handler } from "hono";
import { config } from "./config.js";

const handler: Handler = (c) => {
  if (config.DISALLOW_ROBOT) {
    return c.text("User-agent: *\nDisallow: /");
  } else {
    c.status(404);
    return c.text("");
  }
};

export default handler;
