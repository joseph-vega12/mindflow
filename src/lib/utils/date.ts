import moment from 'moment';

export function formatTimestamp(timestamp: number, format = 'MM/DD/YYYY'): string {
  return moment(timestamp).format(format);
}
