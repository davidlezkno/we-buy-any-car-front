/**
 * Select Component - Reusable select input with consistent interface
 * Implements Interface Segregation Principle (ISP) and Liskov Substitution Principle (LSP)
 */

import { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { ChevronDown, AlertCircle } from 'lucide-react';

/**
 * Select component with label, error, and options support
 * @param {Object} props - Component props
 * @param {string} props.id - Select ID
 * @param {string} props.name - Select name (required)
 * @param {string} props.label - Label text
 * @param {string} props.error - Error message
 * @param {string} props.hint - Hint text
 * @param {Array} props.options - Select options
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.checkmark - Checkmark element
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 */
const Select = forwardRef(
  (
    {
      label,
      error,
      hint,
      options = [],
      placeholder = 'Select an option',
      className,
      checkmark,
      id,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const { onChange: propsOnChange, name, ...restProps } = props;
    const selectId = id || (name ? `${name}-select` : undefined);
    const internalRef = useRef(null);

    const [hasValue, setHasValue] = useState(() => {
      return value !== undefined && value !== '' && value !== null;
    });

    const setRefs = useCallback(
      (node) => {
        internalRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    useEffect(() => {
      const checkValue = () => {
        const currentValue =
          value !== undefined ? value : internalRef.current?.value || '';
        const hasValueState =
          currentValue !== '' && currentValue !== null && currentValue !== undefined;
        setHasValue(hasValueState);
      };

      checkValue();
      const timeout = setTimeout(checkValue, 100);
      return () => clearTimeout(timeout);
    }, [value]);

    const handleChange = (e) => {
      const newValue = e.target.value;
      setHasValue(newValue !== '' && newValue !== null && newValue !== undefined);
      if (onChange) {
        onChange(e);
      } else if (propsOnChange) {
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
              'select-field pr-12 appearance-none',
              error &&
                'border-red-400 focus:border-red-500 focus:ring-red-200',
              hasValue && 'select-has-value',
              className
            )}
            {...(value !== undefined && { value })}
            {...(name && { name })}
            onChange={handleChange}
            {...restProps}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => {
              const optionValue =
                typeof option === 'string' ? option : option.value;
              const optionLabel =
                typeof option === 'string' ? option : option.label || option.value;
              return (
                <option key={optionValue} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>

          {checkmark && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
              {checkmark}
            </div>
          )}

          {!checkmark && (
            <div
              className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 z-10 ${
                props.disabled
                  ? 'text-gray-400 opacity-50'
                  : 'text-gray-500 group-focus-within:text-primary-600'
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

        {hint && !error && (
          <p className="text-sm text-gray-500 mt-1">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;

