import { ServiceRequestField, ServiceRequestFieldType } from '../../types/api';
import { resolveServiceQuestion } from '../../utils/serviceRequestForm';
import { FormField } from '../ui/FormField';
import { SelectField } from '../ui/SelectField';

export function ServiceRequestFields({ fields, answers, onChange }: { fields: ServiceRequestField[]; answers: Record<string, string>; onChange(key: string, value: string): void }) {
  return <>{fields.map(field => {
    const copy = resolveServiceQuestion(field);
    if (!field.required) copy.label += ' (opcional)';
    const value = answers[field.key] || '';
    if (field.type === ServiceRequestFieldType.Select) return <SelectField key={field.key} {...copy} value={value} required={field.required} options={field.options || []} onChange={selectedValue => onChange(field.key, selectedValue)} />;
    return <FormField key={field.key} {...copy} required={field.required} value={value} keyboardType={field.type === ServiceRequestFieldType.Number ? 'decimal-pad' : 'default'} onChangeText={answer => onChange(field.key, answer)} />;
  })}</>;
}
