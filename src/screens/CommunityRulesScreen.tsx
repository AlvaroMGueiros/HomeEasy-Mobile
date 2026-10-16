import { CommunityRulesContent } from '../components/ui/CommunityRulesContent';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';

export function CommunityRulesScreen() {
  return <Screen><SectionHeader eyebrow="Segurança" title="Regras de uso e moderação" /><CommunityRulesContent /></Screen>;
}
