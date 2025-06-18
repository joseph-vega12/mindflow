/**
 * Returns a parsed time
 * @param time - Input in seconds
 * @returns {string} - Output format: "1:01" | "4:03:59" | "123:03:59"
 */
export const secondsParser = (time: number = 0): string => {
  const hrs = Math.floor(time / 3600);
  const mins = Math.floor((time % 3600) / 60);
  const secs = Math.floor(time % 60);

  let result = '';

  if (hrs > 0) {
    result += '' + hrs + ':' + (mins < 10 ? '0' : '');
  }

  result += '' + mins + ':' + (secs < 10 ? '0' : '');
  result += '' + secs;

  return result;
};
