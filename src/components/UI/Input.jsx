import { forwardRef } from "react";
import clsx from "clsx";
import { AlertCircle } from "lucide-react";

const Input = forwardRef(
  ({ label, error, hint, icon: Icon, className, id, ...props }, ref) => {
    // Generate unique ID for automation testing - use provided id or generate from name
    const name = props.name;
    const inputId = id || (name ? `${name}-input` : undefined);

    return (
      <div className="w-full">
        {label && (
          <label className="label hidden md:block" htmlFor={inputId}>
            {label}
          </label>
        )}

        <div className="relative group">
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-600 transition-colors duration-300 z-10">
              <Icon className="w-5 h-5" />
            </div>
          )}

          <input
            ref={ref}
            className={clsx(
              "input-field",
              Icon && "pl-12",
              error && "border-red-400 focus:border-red-500 focus:ring-red-200",
              className,
            )}
            {...props}
            id={inputId}
          />

          {/* Shimmer glow effect on focus */}
          {!error && (
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 opacity-0 group-focus-within:opacity-100 animate-shimmer"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(2, 132, 199, 0.1), transparent)",
                backgroundSize: "200% 100%",
              }}
            ></div>
          )}
        </div>

        {error && (
          <p className="error-message">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}

        {hint && !error && <p className="text-sm text-gray-500 mt-1">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
