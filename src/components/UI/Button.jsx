import clsx from "clsx";
import { motion } from "framer-motion";

// Button consolidates animated call-to-action styling to keep interactions consistent across flows.

const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = "left",
  className,
  onClick,
  type = "button",
  ...props
}) => {
  const baseStyles = "btn inline-flex items-center justify-center gap-2";

  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50",
    ghost: "text-primary-600 hover:bg-primary-50",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading && <div className="spinner" />}

      {!loading && Icon && iconPosition === "left" && (
        <Icon className="w-5 h-5" />
      )}

      {children}

      {!loading && Icon && iconPosition === "right" && (
        <Icon className="w-5 h-5" />
      )}
    </motion.button>
  );
};

export default Button;
