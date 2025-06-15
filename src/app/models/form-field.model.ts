export interface IFormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'file' | 'date' | 'phone' | 'email' | 'separator' | 'toggle' | 'diagram' | 'slider' | 'color' | 'message' | 'social';
  placeholder?: string;
  position: number;
  isActive: boolean;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  validationMessages?: {
    required?: string;
    min?: string;
    max?: string;
    pattern?: string;
    minLength?: string;
    maxLength?: string;
  };
  mask?: {
    mask: string | number;
    blocks?: any;
    unmask?: boolean;
  };
  options?: Array<{
    value: string;
    label: string;
  }>;
  selectMode?: 'autocomplete' | 'select';
  inputmode?: 'text' | 'numeric' | 'tel' | 'email';
  allowMultiple?: boolean;
  unit?: string;
  hint?: string;
} 