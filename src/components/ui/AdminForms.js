export function FormInput({ className = "", ...props }) {
  return (
    <input
      className={`border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 bg-transparent text-zinc-900 dark:text-white ${className}`}
      {...props}
    />
  );
}
export function FormTextarea({ className = "", ...props }) {
  return (
    <textarea
      className={`border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 bg-transparent text-zinc-900 dark:text-white ${className}`}
      {...props}
    />
  );
}
export function FormSelect({ children, className = "", ...props }) {
  return (
    <select
      className={`border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 bg-transparent text-zinc-900 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
export function SubmitButton({
  isLoading,
  loadingText,
  text,
  className = "",
  ...props
}) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`py-3 px-6 rounded-lg font-medium disabled:opacity-50 transition-colors ${className}`}
      {...props}
    >
      {isLoading ? loadingText : text}
    </button>
  );
}
