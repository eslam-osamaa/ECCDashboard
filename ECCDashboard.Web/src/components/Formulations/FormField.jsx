
const inputClass = (hasError) =>
  `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
    hasError
      ? "border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-100"
      : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
  }`;

export function FieldError({ children }) {
  if (!children) return null;

  return (
    <p className="mt-1.5 flex items-start gap-1 text-xs text-red-600">
      <span className="font-bold">!</span>
      <span>{children}</span>
    </p>
  );
}

export default function FormField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  type = "text",
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={inputClass(Boolean(error))}
      />

      {error && (
        <div id={`${name}-error`}>
          <FieldError>{error}</FieldError>
        </div>
      )}
    </div>
  );
}

export { inputClass };