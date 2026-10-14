import { brazilianStates } from '../../config/brazilianStates';
import { SelectField } from './SelectField';

const optionalStates = [{ value: '', label: 'Não informar agora' }, ...brazilianStates];

export function StatePickerField({ value, onChange, required = false }: { value: string; onChange(value: string): void; required?: boolean }) {
  return <SelectField label={required ? 'Estado' : 'Estado (opcional)'} value={value.toUpperCase()} onChange={onChange} options={required ? brazilianStates : optionalStates} placeholder="Selecione o estado" required={required} searchable />;
}
