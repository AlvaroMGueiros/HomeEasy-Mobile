import { Share } from 'react-native';

export function shareProfessional(professional: { id: string; name: string }, context: string) {
  return Share.share({ title: professional.name, message: `${context}\nConheça este profissional no HomeEasy.\nhomeeasy://professionals/${professional.id}` });
}
