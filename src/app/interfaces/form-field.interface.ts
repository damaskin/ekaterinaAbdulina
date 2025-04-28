export interface IFormField {
  id?: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'file' | 'date' | 'phone' | 'email' | 'separator';
  options?: string[];
  isRequired: boolean;
  isActive: boolean;
  position: number;
} 