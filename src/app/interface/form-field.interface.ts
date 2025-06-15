export interface IFormField {
  id?: string;
  label: string;
  type: string;
  required?: boolean;
  options?: Array<{ value: string; label: string; } | { label: string; color: string; min?: number; max?: number; }>;
  accept?: string;
  min?: number;
  max?: number;
  step?: number;
  instagramRequired?: boolean;
  otherSocialRequired?: boolean;
  showMinMax?: boolean;
  allowMultiple?: boolean;
  unit?: string;
  hint?: string;
  placeholder?: string;
} 