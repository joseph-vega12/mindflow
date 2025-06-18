type Percentage = (partialValue: number, totalValue: number) => number;

export const getPercentage: Percentage = (value, total) => {
  if (!value || !total) return 0;

  return Math.floor((value / total) * 100);
};
