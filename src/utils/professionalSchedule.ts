import { Schedule } from '../types/api';

export const professionalWeekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function parseTime(value: string) {
  const selectedTime = new Date();
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    selectedTime.setHours(8, 0, 0, 0);
    return selectedTime;
  }
  const [hours, minutes] = value.split(':').map(Number);
  selectedTime.setHours(Number.isFinite(hours) ? hours : 8, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  return selectedTime;
}

export function formatTime(selectedTime: Date) {
  return `${String(selectedTime.getHours()).padStart(2, '0')}:${String(selectedTime.getMinutes()).padStart(2, '0')}`;
}

export function normalizeProfessionalSchedule(schedule: Schedule): Schedule {
  return {
    periods: schedule.periods.map(period => ({ weekday: period.weekday, startTime: period.startTime.slice(0, 5), endTime: period.endTime.slice(0, 5) })),
    exceptions: schedule.exceptions.map(exception => ({ date: exception.date.slice(0, 10), isUnavailable: exception.isUnavailable, startTime: exception.startTime?.slice(0, 5) || undefined, endTime: exception.endTime?.slice(0, 5) || undefined }))
  };
}

export function validateProfessionalSchedule(schedule: Schedule) {
  if (schedule.periods.length > 42) return 'Você pode cadastrar até 42 intervalos por semana.';
  if (schedule.exceptions.length > 120) return 'Você pode cadastrar até 120 datas especiais.';
  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
  const orderedPeriods = [...schedule.periods].sort((first, second) => first.weekday - second.weekday || first.startTime.localeCompare(second.startTime));
  let previousPeriod: Schedule['periods'][number] | undefined;
  for (const period of orderedPeriods) {
    const day = professionalWeekdays[period.weekday];
    if (!day || !timePattern.test(period.startTime) || !timePattern.test(period.endTime)) return `Informe horários válidos em ${day || 'cada dia'}, no formato HH:MM.`;
    if (period.startTime >= period.endTime) return `Em ${day}, o fim deve ser depois do início.`;
    if (previousPeriod?.weekday === period.weekday && period.startTime < previousPeriod.endTime) return `Existem horários sobrepostos em ${day}.`;
    previousPeriod = period;
  }
  const exceptionDates = new Set<string>();
  for (const exception of schedule.exceptions) {
    if (exceptionDates.has(exception.date)) return 'Existe mais de uma configuração para a mesma data.';
    exceptionDates.add(exception.date);
    if (!exception.isUnavailable && (!exception.startTime || !exception.endTime || !timePattern.test(exception.startTime) || !timePattern.test(exception.endTime) || exception.startTime >= exception.endTime)) return 'Revise o início e o fim dos horários especiais.';
  }
  return null;
}
