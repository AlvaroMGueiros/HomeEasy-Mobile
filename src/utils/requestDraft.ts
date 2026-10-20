import { ServiceRequestField } from '../types/api';
import { resolvePreferredAppointment } from './date';
import { parseOptionalNumber } from './number';
import { prepareServiceAnswers } from './serviceRequestForm';

export enum RequestStep { Details = 'details', Appointment = 'appointment', Review = 'review' }
export interface RequestDraft {
  description: string; answers: Record<string, string>; address: string; city: string; state: string;
  budgetMinimum: string; budgetMaximum: string; preferredDate: string; preferredTime: string;
}

export function prepareRequestDetails(draft: RequestDraft, fields: ServiceRequestField[]) {
  if (draft.description.trim().length < 20) throw new Error('Descreva o serviço usando pelo menos 20 caracteres.');
  return { description: draft.description.trim(), answers: prepareServiceAnswers(fields, draft.answers) };
}

export function prepareRequestAppointment(draft: RequestDraft) {
  if (draft.address.trim().length < 5) throw new Error('Informe a rua, o número e o bairro do atendimento.');
  if (draft.city.trim().length < 2 || !draft.state) throw new Error('Informe a cidade e selecione o estado.');
  const budgetMinimum = parseOptionalNumber(draft.budgetMinimum);
  const budgetMaximum = parseOptionalNumber(draft.budgetMaximum);
  if ((draft.budgetMinimum.trim() && (budgetMinimum === undefined || budgetMinimum < 0)) ||
      (draft.budgetMaximum.trim() && (budgetMaximum === undefined || budgetMaximum < 0))) throw new Error('Informe valores válidos em reais ou deixe o orçamento em branco.');
  if (budgetMinimum !== undefined && budgetMaximum !== undefined && budgetMinimum > budgetMaximum) throw new Error('O valor máximo deve ser igual ou maior que o mínimo.');
  return { address: draft.address.trim(), city: draft.city.trim(), state: draft.state.toUpperCase(), budgetMinimum, budgetMaximum,
    preferredAt: resolvePreferredAppointment(draft.preferredDate, draft.preferredTime) };
}
