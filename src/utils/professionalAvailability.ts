import { formatIsoDate, parseIsoDate } from './date';

export function resolveAvailabilityQuery(date: string, time: string, durationMinutes = 60) {
  if (!date || !time) throw new Error('Escolha a data e o horário da consulta.');
  // The server evaluates weekly schedules in Brasília time, independent of device time zone.
  const parsedDate = parseIsoDate(date);
  if (!parsedDate || formatIsoDate(parsedDate) !== date || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Escolha uma data e um horário válidos.');
  const appointment = new Date(`${date}T${time}:00-03:00`);
  if (appointment.getTime() <= Date.now()) throw new Error('Escolha uma data e um horário futuros.');
  return new URLSearchParams({ availableAt: appointment.toISOString(), durationMinutes: String(durationMinutes) }).toString();
}
