import dayjs from "dayjs";

interface CurrentDateTime {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
}
export const getTime = (timeInput: string | number): number | null => {
  try {
    let num: number;

    // 处理字符串的情况
    if (typeof timeInput === "string") {
      // 尝试将字符串直接转换为数字
      num = Number(timeInput);

      if (isNaN(num)) {
        // 将各种分隔符替换为标准格式
        let standardizedInput = timeInput
          .replace(/(\d{4})-(\d{2})-(\d{2})-(\d{2})/, "$1-$2-$3 $4") // "YYYY-MM-DD-HH" -> "YYYY-MM-DD HH"
          .replace(/(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):?(\d{2})?:?(\d{2})?/, "$1-$2-$3 $4:$5:$6") // "YYYY-MM-DDTHH:mm:ss" -> "YYYY-MM-DD HH:mm:ss"
          .replace(/(\d{4})[-/](\d{2})[-/](\d{2})/, "$1-$2-$3"); // "YYYY/MM/DD" or "YYYY-MM-DD" -> "YYYY-MM-DD"

        // 减少解析过程中可能的多余空格
        standardizedInput = standardizedInput.replace(/\s+/, " ").trim();

        // 处理标准化后的日期时间字符串
        const formatPatterns = [
          "YYYY-MM-DD HH:mm:ss",
          "YYYY-MM-DD HH:mm",
          "YYYY-MM-DD HH",
          "YYYY-MM-DD",
        ];

        let parsedDate: dayjs.Dayjs | null = null;
        for (const pattern of formatPatterns) {
          parsedDate = dayjs(standardizedInput, pattern, true);
          if (parsedDate.isValid()) {
            break;
          }
        }

        if (parsedDate && parsedDate.isValid()) {
          return parsedDate.valueOf();
        } else {
          return null;
        }
      }
    } else {
      num = timeInput;
    }

    // 是否为毫秒级时间戳
    if (num > 946684800000) {
      // 以2000年作为毫秒时间戳参考点
      return num;
    } else {
      return num * 1000;
    }
  } catch (error) {
    return null;
  }
};

export const getCurrentDateTime = (padZero: boolean = false): CurrentDateTime => {
  const now = dayjs();

  // 补零
  const pad = (num: number): string => (num < 10 ? `0${num}` : `${num}`);

  return {
    year: now.year().toString(),
    month: padZero ? pad(now.month() + 1) : (now.month() + 1).toString(),
    day: padZero ? pad(now.date()) : now.date().toString(),
    hour: padZero ? pad(now.hour()) : now.hour().toString(),
    minute: padZero ? pad(now.minute()) : now.minute().toString(),
    second: padZero ? pad(now.second()) : now.second().toString(),
  };
};
