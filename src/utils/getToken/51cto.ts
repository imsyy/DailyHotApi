import { getCache, setCache } from "../cache.js";
import { get } from "../getData.js";
import md5 from "md5";

export const getToken = async () => {
  const cachedData = await getCache("51cto-token");
  if (cachedData?.data) return cachedData.data;
  const result = await get({
    url: "https://api-media.51cto.com/api/token-get",
  });
  const token = result.data.data.data.token;
  await setCache("51cto-token", { data: token, updateTime: new Date().toISOString() });
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
