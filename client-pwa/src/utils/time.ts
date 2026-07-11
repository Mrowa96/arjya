export function toTimeLabel(seconds: number | undefined) {
  if (!seconds) {
    return '0:00';
  }

  const parsedSeconds = Math.floor(Math.abs(seconds));
  const h = Math.floor(parsedSeconds / 3600);
  const m = Math.floor((parsedSeconds % 3600) / 60);
  const s = Math.round(parsedSeconds % 60);
  const t = [h, m > 9 ? m : h ? '0' + m : m || '0', s > 9 ? s : '0' + s].filter(Boolean).join(':');

  return seconds < 0 && parsedSeconds ? `-${t}` : t;
}
