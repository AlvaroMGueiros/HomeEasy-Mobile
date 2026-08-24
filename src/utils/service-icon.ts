import { Feather } from '@expo/vector-icons';

import { normalizeSearchText } from './service-search';

type FeatherIconName = keyof typeof Feather.glyphMap;

const serviceIcons: Array<{ keywords: string[]; icon: FeatherIconName }> = [
  { keywords: ['baba', 'cuidador'], icon: 'user' },
  { keywords: ['cozin', 'chef'], icon: 'coffee' },
  { keywords: ['lav', 'roupa'], icon: 'refresh-cw' },
  { keywords: ['motorista', 'transporte'], icon: 'truck' },
  { keywords: ['seguranca', 'vigilante'], icon: 'shield' },
  { keywords: ['limpeza', 'faxina', 'diarista'], icon: 'wind' },
  { keywords: ['eletric', 'energia'], icon: 'zap' },
  { keywords: ['encan', 'hidraulic'], icon: 'droplet' },
  { keywords: ['pint'], icon: 'edit-3' },
  { keywords: ['jardin', 'paisag'], icon: 'sun' },
  { keywords: ['moveis', 'marcen', 'carpint'], icon: 'box' },
  { keywords: ['reforma', 'pedreir', 'construcao'], icon: 'tool' }
];

export function resolveServiceIcon(serviceName: string): FeatherIconName {
  const normalizedServiceName = normalizeSearchText(serviceName);
  for (const serviceIcon of serviceIcons) {
    if (serviceIcon.keywords.some(keyword => normalizedServiceName.includes(keyword))) return serviceIcon.icon;
  }
  return 'tool';
}
