export enum ServiceIssue { Delay = 'delay', Absence = 'absence', Quality = 'quality', Price = 'price', Damage = 'damage', Conduct = 'conduct', Other = 'other' }
export enum DisputeReason { ServiceNotPerformed = 'service_not_performed', ServiceQuality = 'service_quality', PriceConflict = 'price_conflict', PropertyDamage = 'property_damage', Conduct = 'conduct', Other = 'other' }

export const serviceIssues = [
  { value: ServiceIssue.Delay, label: 'Atraso', reason: DisputeReason.ServiceNotPerformed },
  { value: ServiceIssue.Absence, label: 'Não compareceu', reason: DisputeReason.ServiceNotPerformed },
  { value: ServiceIssue.Quality, label: 'Qualidade do serviço', reason: DisputeReason.ServiceQuality },
  { value: ServiceIssue.Price, label: 'Valor diferente', reason: DisputeReason.PriceConflict },
  { value: ServiceIssue.Damage, label: 'Algo foi danificado', reason: DisputeReason.PropertyDamage },
  { value: ServiceIssue.Conduct, label: 'Comportamento inadequado', reason: DisputeReason.Conduct },
  { value: ServiceIssue.Other, label: 'Outro problema', reason: DisputeReason.Other },
];
