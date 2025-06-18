type Percentage = (partialValue: number, totalValue: number) => number;

export const percentage: Percentage = (value, total) => {
  if (!value || !total) return 0;

  return Math.floor((100 * value) / total);
};
