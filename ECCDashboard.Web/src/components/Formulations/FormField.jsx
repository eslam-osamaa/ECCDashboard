const inputClass = (hasError, disabled = false) =>
  `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
    disabled
      ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500"
      : hasError
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
  disabled = false,
  hint,
  type = "text",
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className={`mb-1.5 block text-sm font-medium ${
          disabled ? "text-gray-500" : "text-gray-700"
        }`}
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
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={inputClass(Boolean(error), disabled)}
      />

      {error && (
        <div id={`${name}-error`}>
          <FieldError>{error}</FieldError>
        </div>
      )}

      {!error && hint && (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}

export { inputClass };