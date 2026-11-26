import { type IconName } from '../components/ui/AppIcon';

import { normalizeSearchText } from './service-search';


interface ServiceIconRule {
  keywords: string[];
  icon: IconName;
}

const serviceIcons: ServiceIconRule[] = [
  // Cuidados específicos
  { keywords: ['cuidador de animais', 'animais', 'animal', 'pet', 'cachorro', 'gato'], icon: 'paw' },
  { keywords: ['cuidador de idosos', 'idoso', 'idosos', 'geriatria', 'enfermagem'], icon: 'hand-heart' },
  { keywords: ['baba', 'crianca', 'infantil'], icon: 'baby' },

  // Climatização e dedetização
  { keywords: ['ar condicionado', 'ar-condicionado', 'climatizacao', 'ventilador'], icon: 'snowflake' },
  { keywords: ['dedetizacao', 'pragas', 'insetos', 'cupim', 'desinsetizacao'], icon: 'bug' },

  // Energia e instalações
  { keywords: ['energia solar', 'solar', 'fotovoltaic'], icon: 'solar-panel' },
  { keywords: ['eletricista', 'eletrica', 'tomada', 'iluminacao', 'fiacao', 'energia'], icon: 'zap' },
  { keywords: ['encanador', 'hidraulica', 'vazamento', 'desentup', 'torneira'], icon: 'pipe' },

  // Limpeza
  { keywords: ['limpeza pos obra', 'pos-obra', 'entulho'], icon: 'trash-2' },
  { keywords: ['limpeza', 'faxina', 'diarista', 'domestica'], icon: 'broom' },
  { keywords: ['lavadeira', 'lavanderia', 'roupa', 'passadeira'], icon: 'shirt' },
  { keywords: ['cozinheiro', 'cozinheira', 'chef', 'cozinha', 'comida'], icon: 'chef-hat' },

  // Reforma, acabamento e construção
  { keywords: ['pintura', 'pintor', 'tinta', 'parede'], icon: 'paint-roller' },
  { keywords: ['jardinagem', 'jardineiro', 'jardim', 'poda', 'grama', 'paisagismo'], icon: 'plant' },
  { keywords: ['montagem de moveis', 'montador'], icon: 'armchair' },
  { keywords: ['marceneiro', 'marcenaria', 'carpinteiro', 'moveis', 'madeira'], icon: 'hammer' },
  { keywords: ['chaveiro', 'fechadura', 'tranca', 'chave'], icon: 'key' },
  { keywords: ['cameras', 'camera', 'cftv', 'alarme'], icon: 'security-camera' },
  { keywords: ['seguranca', 'vigilante', 'guarda', 'portaria'], icon: 'shield' },
  { keywords: ['eletrodomesticos', 'eletrodomestico', 'geladeira', 'fogao', 'maquina de lavar'], icon: 'tv' },
  { keywords: ['mudanca e frete', 'mudanca', 'frete', 'carreto', 'guincho'], icon: 'truck' },
  { keywords: ['motorista', 'transporte', 'transfer'], icon: 'car' },
  { keywords: ['gesso', 'drywall', 'sanca'], icon: 'wall' },
  { keywords: ['vidraceiro', 'vidro', 'box de banheiro', 'espelho'], icon: 'frame' },
  { keywords: ['telhadista', 'telhado', 'calha', 'infiltracao'], icon: 'roof' },
  { keywords: ['arquiteto', 'arquitetura', 'projeto', 'decorador', 'decoracao'], icon: 'ruler' },
  { keywords: ['pedreiro', 'obra', 'construcao', 'alvenaria', 'reforma'], icon: 'wall' }
];

export function resolveServiceIcon(serviceName: string): IconName {
  const normalizedServiceName = normalizeSearchText(serviceName);
  for (const serviceIcon of serviceIcons) {
    if (serviceIcon.keywords.some(keyword => normalizedServiceName.includes(normalizeSearchText(keyword)))) {
      return serviceIcon.icon;
    }
  }
  return 'tool';
}

