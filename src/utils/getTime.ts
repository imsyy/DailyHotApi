import dayjs from "dayjs";

interface CurrentDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}
export const getTime = (timeInput: string | number): number => {
  try {
    let num: number | string;
    // 尝试将输入转换为数字
    if (typeof timeInput === "string") {
      num = Number(timeInput);
      // 检查转换结果是否为有效数字
      if (isNaN(num)) {
        // 处理为字符串的日期时间
        return dayjs(timeInput).valueOf();
      }
    } else {
      num = timeInput;
    }
    // 是否为毫秒级时间戳
    if (num > 946684800000) {
      return num;
    } else {
      return num * 1000;
    }
  } catch (error) {
    return null;
  }
};

export const getCurrentDateTime = (): CurrentDateTime => {
  const now = dayjs();

  return {
    year: now.year(),
    month: now.month() + 1,
    day: now.date(),
    hour: now.hour(),
    minute: now.minute(),
    second: now.second(),
  };
};
