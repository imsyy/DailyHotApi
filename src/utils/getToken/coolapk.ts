import md5 from "md5";

/**
 * 获取随机的DEVICE_ID
 * @returns DEVICE_ID
 */
const getRandomDEVICE_ID = () => {
  const id = [10, 6, 6, 6, 14];
  return id.map((i) => Math.random().toString(36).substring(2, i)).join("-");
};

/**
 * 获取APP_TOKEN
 * @returns APP_TOKEN
 */
const get_app_token = () => {
  const DEVICE_ID = getRandomDEVICE_ID();
  const now = Math.round(Date.now() / 1000);
  const hex_now = "0x" + now.toString(16);
  const md5_now = md5(now.toString());
  const s =
    "token://com.coolapk.market/c67ef5943784d09750dcfbb31020f0ab?" +
    md5_now +
    "$" +
    DEVICE_ID +
    "&com.coolapk.market";
  const md5_s = md5(Buffer.from(s).toString("base64"));
  const token = md5_s + DEVICE_ID + hex_now;
  return token;
};

/**
 * 获取请求头
 * @returns 请求头
 */
export const genHeaders = () => {
  return {
    "X-Requested-With": "XMLHttpRequest",
    "X-App-Id": "com.coolapk.market",
    "X-App-Token": get_app_token(),
    "X-Sdk-Int": "29",
    "X-Sdk-Locale": "zh-CN",
    "X-App-Version": "11.0",
    "X-Api-Version": "11",
    "X-App-Code": "2101202",
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 10; Mi 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.5563.15 Mobile Safari/537.36",
  };
};
