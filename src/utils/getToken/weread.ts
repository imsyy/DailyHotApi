/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from "crypto";

/**
 * 获取微信读书的书籍 ID
 * 感谢 @MCBBC 及 ChatGPT
 */
const getWereadID = (bookId: string) => {
  try {
    // 使用 MD5 哈希算法创建哈希对象
    const hash = crypto.createHash("md5");
    hash.update(bookId);
    const str = hash.digest("hex");
    // 取哈希结果的前三个字符作为初始值
    let strSub = str.substring(0, 3);
    // 判断书籍 ID 的类型并进行转换
    let fa: (string | any[])[];
    if (/^\d*$/.test(bookId)) {
      // 如果书籍 ID 只包含数字，则将其拆分成长度为 9 的子字符串，并转换为十六进制表示
      const chunks = [];
      for (let i = 0; i < bookId.length; i += 9) {
        const chunk = bookId.substring(i, i + 9);
        chunks.push(parseInt(chunk).toString(16));
      }
      fa = ["3", chunks];
    } else {
      // 如果书籍 ID 包含其他字符，则将每个字符的 Unicode 编码转换为十六进制表示
      let hexStr = "";
      for (let i = 0; i < bookId.length; i++) {
        hexStr += bookId.charCodeAt(i).toString(16);
      }
      fa = ["4", [hexStr]];
    }
    // 将类型添加到初始值中
    strSub += fa[0];
    // 将数字 2 和哈希结果的后两个字符添加到初始值中
    strSub += "2" + str.substring(str.length - 2);
    // 处理转换后的子字符串数组
    for (let i = 0; i < fa[1].length; i++) {
      const sub = fa[1][i];
      const subLength = sub.length.toString(16);
      // 如果长度只有一位数，则在前面添加 0
      const subLengthPadded = subLength.length === 1 ? "0" + subLength : subLength;
      // 将长度和子字符串添加到初始值中
      strSub += subLengthPadded + sub;
      // 如果不是最后一个子字符串，则添加分隔符 'g'
      if (i < fa[1].length - 1) {
        strSub += "g";
      }
    }
    // 如果初始值长度不足 20，从哈希结果中取足够的字符补齐
    if (strSub.length < 20) {
      strSub += str.substring(0, 20 - strSub.length);
    }
    // 使用 MD5 哈希算法创建新的哈希对象
    const finalHash = crypto.createHash("md5");
    finalHash.update(strSub);
    const finalStr = finalHash.digest("hex");
    // 取最终哈希结果的前三个字符并添加到初始值的末尾
    strSub += finalStr.substring(0, 3);
    return strSub;
  } catch (error) {
    console.error("处理微信读书 ID 时出现错误：" + error);
    return null;
  }
};

export default getWereadID;
