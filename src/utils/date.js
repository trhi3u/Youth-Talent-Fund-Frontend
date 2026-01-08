import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TZ = 'Asia/Ho_Chi_Minh';
dayjs.tz.setDefault(DEFAULT_TZ);


export const formatLocal = (value, format = 'DD/MM/YYYY HH:mm') => {
  if (!value) return '';
  return dayjs.utc(value).tz(DEFAULT_TZ).format(format);
};


export const toUtcString = (value, tz = DEFAULT_TZ) => {
  if (!value) return null;
  return dayjs.tz(value, tz).utc().toISOString();
};


export const toLocalHCM = (value, tz = DEFAULT_TZ) => {
  if (!value) return '';
  return dayjs.utc(value).tz(tz).format('YYYY-MM-DDTHH:mm');
};

export const nowUtcString = () => dayjs.utc().toISOString();

export const DEFAULT_TIMEZONE = DEFAULT_TZ;
