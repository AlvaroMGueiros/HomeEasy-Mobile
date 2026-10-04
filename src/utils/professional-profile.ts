import { Professional, ProfessionalService, Schedule } from '../types/api';
import { formatCurrency } from './currency';

export function resolveProfessionalProfileSummary(professional: Professional) {
  const activeServices: ProfessionalService[] = [];
  let startingPrice: number | null = null;
  for (const service of professional.services) {
    if (service.isActive === false) continue;
    activeServices.push(service);
    if (service.basePrice === null || service.basePrice === undefined) continue;
    const price = Number(service.basePrice);
    if (Number.isFinite(price) && price > 0 && (startingPrice === null || price < startingPrice)) startingPrice = price;
  }
  const location = [professional.city, professional.state].filter(Boolean).join(', ');
  let coverage = 'Região de atendimento a combinar';
  if (professional.city) {
    coverage = `Atende ${professional.city} e região`;
    if (professional.serviceRadiusKm && professional.serviceRadiusKm > 0) coverage += ` · até ${professional.serviceRadiusKm} km`;
  }
  return {
    activeServices,
    startingPrice,
    priceLabel: startingPrice === null ? 'Orçamento personalizado' : `A partir de ${formatCurrency(startingPrice)}`,
    specialty: activeServices.length ? activeServices.map(service => service.name).join(' · ') : 'Profissional Home Easy',
    location: location || 'Localização não informada',
    coverage
  };
}

const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export function resolveProfessionalSchedule(schedule?: Schedule | null) {
  if (!schedule) return [];
  return schedule.periods.flatMap(period => {
    const day = weekdays[period.weekday];
    if (!day || !/^\d{2}:\d{2}/.test(period.startTime) || !/^\d{2}:\d{2}/.test(period.endTime)) return [];
    return [{ key: `${period.weekday}-${period.startTime}-${period.endTime}`, day, hours: `${period.startTime.slice(0, 5)} às ${period.endTime.slice(0, 5)}` }];
  });
}
