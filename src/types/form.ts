/**
 * Form-related type definitions
 */

export interface BaseInputProps {
  id?: string;
  name: string;
  label?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export interface TextInputProps extends BaseInputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  value?: string;
  onChange?: (value: string) => void;
}

export interface SelectInputProps extends BaseInputProps {
  options: Array<{ label: string; value: string } | string>;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  checkmark?: React.ReactNode;
}

export interface FormFieldError {
  type: string;
  message: string;
}

export interface ValidationRule {
  pattern?: RegExp;
  message: string;
  required?: boolean;
  min?: number;
  max?: number;
}

