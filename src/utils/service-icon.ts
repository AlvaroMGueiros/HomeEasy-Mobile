import { Feather } from '@expo/vector-icons';

import { normalizeSearchText } from './service-search';

type FeatherIconName = keyof typeof Feather.glyphMap;

interface ServiceIconRule {
  keywords: string[];
  icon: FeatherIconName;
}

const serviceIcons: ServiceIconRule[] = [
  // Cuidados específicos
  { keywords: ['cuidador de animais', 'animais', 'animal', 'pet', 'cachorro', 'gato'], icon: 'heart' },
  { keywords: ['cuidador de idosos', 'idoso', 'idosos', 'geriatria', 'enfermagem'], icon: 'activity' },
  { keywords: ['baba', 'crianca', 'infantil'], icon: 'smile' },

  // Climatização e dedetização
  { keywords: ['ar condicionado', 'ar-condicionado', 'climatizacao', 'ventilador'], icon: 'wind' },
  { keywords: ['dedetizacao', 'pragas', 'insetos', 'cupim', 'desinsetizacao'], icon: 'alert-octagon' },

  // Energia e instalações
  { keywords: ['energia solar', 'solar', 'fotovoltaic'], icon: 'sun' },
  { keywords: ['eletricista', 'eletrica', 'tomada', 'iluminacao', 'fiacao', 'energia'], icon: 'zap' },
  { keywords: ['encanador', 'hidraulica', 'vazamento', 'desentup', 'torneira'], icon: 'droplet' },

  // Limpeza
  { keywords: ['limpeza pos obra', 'pos-obra', 'entulho'], icon: 'trash-2' },
  { keywords: ['limpeza', 'faxina', 'diarista', 'domestica'], icon: 'check-circle' },
  { keywords: ['lavadeira', 'lavanderia', 'roupa', 'passadeira'], icon: 'refresh-cw' },
  { keywords: ['cozinheiro', 'cozinheira', 'chef', 'cozinha', 'comida'], icon: 'coffee' },

  // Reforma, acabamento e construção
  { keywords: ['pintura', 'pintor', 'tinta', 'parede'], icon: 'edit-3' },
  { keywords: ['jardinagem', 'jardineiro', 'jardim', 'poda', 'grama', 'paisagismo'], icon: 'compass' },
  { keywords: ['montagem de moveis', 'montador'], icon: 'layers' },
  { keywords: ['marceneiro', 'marcenaria', 'carpinteiro', 'moveis', 'madeira'], icon: 'box' },
  { keywords: ['chaveiro', 'fechadura', 'tranca', 'chave'], icon: 'key' },
  { keywords: ['cameras', 'camera', 'cftv', 'alarme'], icon: 'camera' },
  { keywords: ['seguranca', 'vigilante', 'guarda', 'portaria'], icon: 'shield' },
  { keywords: ['eletrodomesticos', 'eletrodomestico', 'geladeira', 'fogao', 'maquina de lavar'], icon: 'tv' },
  { keywords: ['mudanca e frete', 'mudanca', 'frete', 'carreto', 'guincho'], icon: 'truck' },
  { keywords: ['motorista', 'transporte', 'transfer'], icon: 'navigation' },
  { keywords: ['gesso', 'drywall', 'sanca'], icon: 'square' },
  { keywords: ['vidraceiro', 'vidro', 'box de banheiro', 'espelho'], icon: 'maximize-2' },
  { keywords: ['telhadista', 'telhado', 'calha', 'infiltracao'], icon: 'umbrella' },
  { keywords: ['arquiteto', 'arquitetura', 'projeto', 'decorador', 'decoracao'], icon: 'layout' },
  { keywords: ['pedreiro', 'obra', 'construcao', 'alvenaria', 'reforma'], icon: 'home' }
];

export function resolveServiceIcon(serviceName: string): FeatherIconName {
  const normalizedServiceName = normalizeSearchText(serviceName);
  for (const serviceIcon of serviceIcons) {
    if (serviceIcon.keywords.some(keyword => normalizedServiceName.includes(normalizeSearchText(keyword)))) {
      return serviceIcon.icon;
    }
  }
  return 'tool';
}

