export function formatDate(dateValue: string) {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return 'Data não informada';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parsedDate);
}

export function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(dateValue: string) {
  const [year, month, day] = dateValue.split('-').map(Number);
  if (!year || !month || !day) return null;
  const parsedDate = new Date(year, month - 1, day, 12);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function formatIsoDateForDisplay(dateValue: string) {
  const parsedDate = parseIsoDate(dateValue);
  if (!parsedDate) return 'Selecione uma data';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(parsedDate);
}
