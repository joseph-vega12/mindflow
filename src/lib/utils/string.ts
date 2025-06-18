export const capitalize = (text: string | undefined): string => {
  if (!text) return '';
  return `${text.toString().charAt(0).toUpperCase()}${text.toString().slice(1)}`;
};
