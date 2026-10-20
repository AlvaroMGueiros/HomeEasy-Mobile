import { ServiceRequestField, ServiceRequestFieldType } from '../types/api';
import { parseOptionalNumber } from './number';

const questionCopy: Record<string, { label: string; hint?: string; placeholder?: string }> = {
  propertySize: { label: 'Tamanho aproximado do imóvel', hint: 'Em metros quadrados. Se não souber o tamanho exato, informe uma estimativa.', placeholder: 'Ex.: 60' },
  paintArea: { label: 'Tamanho aproximado da área a pintar', hint: 'Em metros quadrados. Você pode informar uma estimativa.', placeholder: 'Ex.: 30' },
  bedroomCount: { label: 'Quantos quartos tem o imóvel?', hint: 'Se não houver quartos, informe 0.', placeholder: 'Ex.: 2' },
  roomCount: { label: 'Quantos cômodos precisam do serviço?', placeholder: 'Ex.: 3' },
  furnitureCount: { label: 'Quantos móveis precisam do serviço?', placeholder: 'Ex.: 2' },
  furnitureType: { label: 'Quais são os móveis?', placeholder: 'Ex.: um guarda-roupa e uma cama' },
  deviceCount: { label: 'Quantos aparelhos precisam do serviço?', placeholder: 'Ex.: 1' },
  devicePower: { label: 'Qual é a capacidade do aparelho?', placeholder: 'Ex.: ar-condicionado de 9.000 BTUs' },
  frequency: { label: 'Com que frequência você precisa do serviço?', placeholder: 'Ex.: uma vez por semana' },
  waterShutOff: { label: 'Você consegue fechar o registro de água?' },
  cleaningSupplies: { label: 'Você tem os produtos de limpeza?' },
  debrisRemoval: { label: 'É preciso retirar restos de obra ou entulho?' },
  paintIncluded: { label: 'Você já comprou a tinta?' },
  origin: { label: 'De onde será feita a mudança?', placeholder: 'Informe o bairro ou a cidade de saída' },
  destination: { label: 'Para onde será feita a mudança?', placeholder: 'Informe o bairro ou a cidade de chegada' },
  helpersNeeded: { label: 'Você vai precisar de ajudantes?' }
};

export function resolveServiceQuestion(field: ServiceRequestField) {
  const copy = questionCopy[field.key];
  const label = copy?.label || field.label;
  return { label: field.unit ? `${label} (${field.unit})` : label, hint: copy?.hint, placeholder: copy?.placeholder };
}

export function prepareServiceAnswers(fields: ServiceRequestField[], answers: Record<string, string>) {
  const prepared: Record<string, string | number> = {};
  for (const field of fields) {
    const value = answers[field.key]?.trim() || '';
    const label = resolveServiceQuestion(field).label;
    if (!value) {
      if (field.required) throw new Error(`Responda à pergunta: ${label}`);
      continue;
    }
    if (field.type === ServiceRequestFieldType.Number) {
      const numericValue = parseOptionalNumber(value);
      if (numericValue === undefined || (field.minimum !== undefined && numericValue < field.minimum)) {
        throw new Error(`Informe um número válido em “${label}”. O menor valor permitido é ${field.minimum ?? 0}.`);
      }
      prepared[field.key] = numericValue;
    } else {
      if (field.type === ServiceRequestFieldType.Select && !field.options?.some(option => option.value === value)) {
        throw new Error(`Escolha uma das opções em “${label}”.`);
      }
      prepared[field.key] = value;
    }
  }
  return prepared;
}

export function resolveServiceAnswerDetails(answers: Record<string, string | number | boolean> | undefined, requestForm: ServiceRequestField[] = []) {
  if (!answers) return [];
  const fields = new Map(requestForm.map(field => [field.key, field]));
  return Object.entries(answers).map(([key, answer]) => {
    const field = fields.get(key);
    let value = String(answer);
    if (typeof answer === 'boolean') value = answer ? 'Sim' : 'Não';
    const selectedOption = field?.options?.find(option => option.value === value);
    if (selectedOption) value = selectedOption.label;
    else if (value === 'yes') value = 'Sim';
    else if (value === 'no') value = 'Não';
    return { key, label: field ? resolveServiceQuestion(field).label : 'Informação adicional do serviço', value };
  });
}
