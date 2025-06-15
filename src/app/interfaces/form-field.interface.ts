export interface IFormField {
  id?: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'file' | 'date' | 'phone' | 'email' | 'separator' | 'toggle' | 'diagram';
  options?: string[];
  isRequired: boolean;
  isActive: boolean;
  position: number;
  allowMultiple?: boolean;
  unit?: string;
  hint?: string;
  placeholder?: string;
} 