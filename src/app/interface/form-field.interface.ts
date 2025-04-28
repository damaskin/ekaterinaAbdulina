export interface IFormField {
  id?: string;
  label: string;
  type: string;
  required?: boolean;
  options?: { value: string; label: string; }[];
  accept?: string;
} 