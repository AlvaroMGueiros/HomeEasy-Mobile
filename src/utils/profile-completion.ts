import { UserProfile } from '../types/api';

export function resolveProfileCompletion(profile: UserProfile) {
  const fields = [
    { complete: Boolean(profile.profilePhotoMediaId), label: 'Adicione uma foto para facilitar sua identificação.' },
    { complete: Boolean(profile.phone), label: 'Informe um telefone para contato.' },
    { complete: Boolean(profile.city && profile.state), label: 'Informe sua cidade e estado para melhorar os resultados.' },
    { complete: Boolean(profile.address), label: 'Complete o endereço para agilizar suas solicitações.' }
  ];
  let completeCount = 0;
  let nextStep = '';
  for (const field of fields) {
    if (field.complete) completeCount += 1;
    else if (!nextStep) nextStep = field.label;
  }
  return { percentage: Math.round(completeCount / fields.length * 100), nextStep };
}
