import { ServiceIssue, serviceIssues } from '../config/serviceIssues';

export function prepareServiceIssue(issue: ServiceIssue, description: string) {
  const selectedIssue = serviceIssues.find(option => option.value === issue);
  if (!selectedIssue) throw new Error('Selecione o motivo do relato.');
  if (description.trim().length < 20) throw new Error('Explique o problema usando pelo menos 20 caracteres.');
  const detailedDescription = `[${selectedIssue.label}] ${description.trim()}`;
  if (detailedDescription.length > 3000) throw new Error('Reduza o relato para no máximo 2.900 caracteres.');
  return { reason: selectedIssue.reason, description: detailedDescription };
}
