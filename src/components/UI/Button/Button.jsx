/**
 * Button Component - Reusable button with variants
 * Implements Single Responsibility Principle (SRP) and Open/Closed Principle (OCP)
 */

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { buttonVariants, buttonSizes, buttonBaseStyles } from './variants';

/**
 * Button component with multiple variants and sizes
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - Button variant (primary, secondary, outline, ghost, danger)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {React.ComponentType} props.icon - Icon component
 * @param {string} props.iconPosition - Icon position (left, right)
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 * @param {string} props.type - Button type
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className,
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={clsx(
        buttonBaseStyles,
        buttonVariants[variant] || buttonVariants.primary,
        buttonSizes[size] || buttonSizes.md,
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading && <div className="spinner" />}

      {!loading && Icon && iconPosition === 'left' && (
        <Icon className="w-5 h-5" />
      )}

      {children}

      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-5 h-5" />
      )}
    </motion.button>
  );
};


export default Button;

