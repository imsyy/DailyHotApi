export const parseChineseNumber = (chineseNumber: string): number => {
  // 单位对照表
  const units: { [key: string]: number } = {
    亿: 1e8,
    万: 1e4,
    千: 1e3,
    百: 1e2,
  };

  // 遍历单位对照表
  for (const unit in units) {
    if (chineseNumber.includes(unit)) {
      // 转换为数字
      const numberPart = parseFloat(chineseNumber.replace(unit, ""));
      return numberPart * units[unit];
    }
  }

  return parseFloat(chineseNumber);
};
