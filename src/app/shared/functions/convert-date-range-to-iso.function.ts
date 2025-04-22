export function convertDateRangeToISO(dateRange: string[]) {
  if (!Array.isArray(dateRange) || dateRange.length < 2) {
    throw new Error('dateRange precisa ser um array [início, fim]');
  }

  const start = new Date(dateRange[0]);
  const end = new Date(dateRange[1]);

  start.setHours(0, 0, 0, 0);

  end.setDate(end.getDate() + 1);
  end.setHours(3, 0, 0, 0);

  return {
    startISO: toLocalISOString(start),
    endISO: toLocalISOString(end),
  };
}

function toLocalISOString(date: Date) {
  const tzOffsetMs = date.getTimezoneOffset() * 60_000;
  const localTs = date.getTime() - tzOffsetMs;
  return new Date(localTs).toISOString();
}
