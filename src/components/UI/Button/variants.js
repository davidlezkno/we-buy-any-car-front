/**
 * Button Variants Configuration
 * Implements Open/Closed Principle (OCP) - Easy to extend with new variants
 */

export const buttonVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
  ghost: 'text-primary-600 hover:bg-primary-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
};

export const buttonSizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const buttonBaseStyles = 'btn inline-flex items-center justify-center gap-2';

