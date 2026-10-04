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

export function formatAppointment(dateValue?: string | null) {
  if (!dateValue) return 'Agendamento a combinar';
  const appointmentDate = new Date(dateValue);
  if (Number.isNaN(appointmentDate.getTime())) return 'Data do agendamento indisponível';
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(appointmentDate);
}

export function formatAppointmentDay(dateValue?: string | null) {
  if (!dateValue) return 'Data a combinar';
  const appointmentDate = new Date(dateValue);
  if (Number.isNaN(appointmentDate.getTime())) return 'Data indisponível';
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' }).format(appointmentDate);
}

export function formatAppointmentTimeRange(dateValue?: string | null, durationMinutes?: number) {
  if (!dateValue) return 'Combine o horário pela conversa';
  const startDate = new Date(dateValue);
  if (Number.isNaN(startDate.getTime())) return 'Horário indisponível';
  const formatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const startTime = formatter.format(startDate);
  if (!durationMinutes || !Number.isFinite(durationMinutes) || durationMinutes < 0) return startTime;
  const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);
  let range = `${startTime} – ${formatter.format(endDate)}`;
  if (formatIsoDate(startDate) !== formatIsoDate(endDate)) range += ` (${formatAppointmentDay(endDate.toISOString())})`;
  return range;
}
