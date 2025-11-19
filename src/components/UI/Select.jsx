import { forwardRef, useState, useEffect, useRef, useCallback } from "react";
import clsx from "clsx";
import { ChevronDown, AlertCircle } from "lucide-react";

const Select = forwardRef(
  (
    {
      label,
      error,
      hint,
      options = [],
      placeholder = "Select an option",
      className,
      checkmark,
      id,
      onChange,
      value,
      ...props
    },
    ref,
  ) => {
    // Extract onChange and name from props to avoid conflicts
    const { onChange: propsOnChange, name, ...restProps } = props;
    
    // Generate unique ID for automation testing - use provided id or generate from name
    const selectId = id || (name ? `${name}-select` : undefined);
    const internalRef = useRef(null);
    
    // Track if select has a value
    const [hasValue, setHasValue] = useState(() => {
      // Initialize based on value prop
      return value !== undefined && value !== "" && value !== null;
    });
    
    // Combined ref callback to handle both internal and external refs
    const setRefs = useCallback(
      (node) => {
        internalRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );
    
    // Check value when value prop changes or on mount
    useEffect(() => {
      const checkValue = () => {
        const currentValue = value !== undefined 
          ? value 
          : (internalRef.current?.value || "");
        const hasValueState = currentValue !== "" && currentValue !== null && currentValue !== undefined;
        setHasValue(hasValueState);
      };
      
      checkValue();
      // Also check after a short delay to catch react-hook-form updates
      const timeout = setTimeout(checkValue, 100);
      return () => clearTimeout(timeout);
    }, [value]);

    // Handle onChange to update hasValue state
    const handleChange = (e) => {
      const newValue = e.target.value;
      setHasValue(newValue !== "" && newValue !== null && newValue !== undefined);
      // Call the original onChange if it exists (from props or passed directly)
      if (onChange) {
        onChange(e);
      } else if (propsOnChange) {
        // Also check propsOnChange in case it comes from register
        propsOnChange(e);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="label hidden md:block" htmlFor={selectId}>
            {label}
          </label>
        )}

        <div className="relative group">
          <select
            ref={setRefs}
            id={selectId}
            className={clsx(
              "select-field pr-12 appearance-none",
              error && "border-red-400 focus:border-red-500 focus:ring-red-200",
              hasValue && "select-has-value",
              className,
            )}
            {...(value !== undefined && { value })}
            {...(name && { name })}
            onChange={handleChange}
            {...restProps}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => {
              const optionValue =
                typeof option === "string" ? option : option.value;
              const optionLabel =
                typeof option === "string"
                  ? option
                  : option.label || option.value;
              return (
                <option key={optionValue} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>

          {/* Checkmark slot - positioned over arrow when exists */}
          {checkmark && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
              {checkmark}
            </div>
          )}

          {/* Dropdown arrow - hidden when checkmark exists */}
          {!checkmark && (
            <div
              className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 z-10 ${
                props.disabled
                  ? "text-gray-400 opacity-50"
                  : "text-gray-500 group-focus-within:text-primary-600"
              }`}
            >
              <ChevronDown className="w-5 h-5" />
            </div>
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

Select.displayName = "Select";

export default Select;
