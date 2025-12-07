/**
 * RadioGroup - Reusable radio button group component
 * Implements Single Responsibility Principle (SRP)
 */

/**
 * Radio group for Yes/No questions
 * @param {Object} props - Component props
 * @param {string} props.label - Question label
 * @param {string} props.name - Form field name
 * @param {Function} props.register - React Hook Form register function
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.hint - Optional hint text
 */
const RadioGroup = ({ label, name, register, error, required = false, hint }) => {
  return (
    <div>
      <label className="label mb-3 block">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="Yes"
            id={`${name}-yes-radio`}
            {...register(name, {
              required: required ? 'This field is required' : false,
            })}
            className="w-5 h-5 text-primary-600"
          />
          <span className="text-gray-700">Yes</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="No"
            id={`${name}-no-radio`}
            {...register(name, {
              required: required ? 'This field is required' : false,
            })}
            className="w-5 h-5 text-primary-600"
          />
          <span className="text-gray-700 font-bold">No</span>
        </label>
      </div>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  );
};

export default RadioGroup;
