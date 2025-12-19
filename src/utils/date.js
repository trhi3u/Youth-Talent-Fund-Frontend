const tzOffsetMs = 7 * 60 * 60 * 1000;

export const toUtcString = value => {
  if (!value) return null;
  const dt = new Date(value);
  return new Date(dt.getTime() - tzOffsetMs).toISOString();
};

export const toLocalHCM = value => {
  if (!value) return '';
  const dt = new Date(value);
  const local = new Date(dt.getTime() + tzOffsetMs);
  return local.toISOString().slice(0, 16);
};

export const nowUtcString = () => new Date().toISOString();
