import { getCache, setCache } from "../cache.js";
import { get } from "../getData.js";
import md5 from "md5";

export const getToken = async () => {
  const cachedData = getCache("51cto-token");
  if (cachedData && typeof cachedData === "object" && "token" in cachedData) {
    const { token } = cachedData as { token: string };
    return token;
  }
  const result = await get({
    url: "https://api-media.51cto.com/api/token-get",
  });
  const token = result.data.data.data.token;
  setCache("51cto-token", { token });
  return token;
};

export const sign = (
  requestPath: string,
  payload: Record<string, unknown> = {},
  timestamp: number,
  token: string,
) => {
  payload.timestamp = timestamp;
  payload.token = token;
  const sortedParams = Object.keys(payload).sort();
  return md5(md5(requestPath) + md5(sortedParams + md5(token) + timestamp));
};
