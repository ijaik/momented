import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

interface FieldLabelProps {
  htmlFor?: string;
  children: ReactNode;
  as?: "label" | "span";
}
export function FieldLabel({ htmlFor, children, as }: FieldLabelProps) {
  if (as === "span" || !htmlFor)
    return (
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
        {children}
      </span>
    );
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted"
    >
      {children}
    </label>
  );
}
const baseInputStyle =
  "w-full rounded-xl border border-line/80 bg-surface/80 px-3.5 py-2.5 text-[15px] text-ink placeholder:text-faint backdrop-blur-xs transition-all duration-150 hover:border-ink/30 focus:border-ink/40 focus:outline-hidden focus:ring-2 focus:ring-ink/15";
interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}
export function FormInput({
  id,
  name,
  className = "",
  ...props
}: FormInputProps) {
  const resolvedId = id || name;
  const resolvedName = name || id;
  return (
    <input
      id={resolvedId}
      name={resolvedName}
      className={`${baseInputStyle} ${className}`}
      {...props}
    />
  );
}
interface FormTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}
export function FormTextarea({
  id,
  name,
  className = "",
  ...props
}: FormTextareaProps) {
  const resolvedId = id || name;
  const resolvedName = name || id;
  return (
    <textarea
      id={resolvedId}
      name={resolvedName}
      className={`${baseInputStyle} ${className}`}
      {...props}
    />
  );
}
interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  children?: ReactNode;
}
export function FormSelect({
  id,
  name,
  children,
  className = "",
  ...props
}: FormSelectProps) {
  const resolvedId = id || name;
  const resolvedName = name || id;
  return (
    <select
      id={resolvedId}
      name={resolvedName}
      className={`${baseInputStyle} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: ReactNode;
  text: ReactNode;
  size?: "sm" | "md";
  className?: string;
}
export function SubmitButton({
  isLoading,
  loadingText,
  text,
  size = "sm",
  className = "",
  ...props
}: SubmitButtonProps) {
  const sizes = {
    sm: "px-4 py-2 text-xs uppercase tracking-wider gap-1.5 rounded-full",
    md: "px-6 py-2.5 text-xs uppercase tracking-wider gap-2 rounded-full",
  };
  return (
    <button
      {...props}
      type="submit"
      disabled={isLoading || props.disabled}
      className={`inline-flex items-center justify-center font-semibold bg-solid text-on-solid shadow-xs transition-all duration-100 ease-out hover:opacity-90 active:scale-98 disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:ring-offset-2 ${sizes[size]} ${className}`}
    >
      {isLoading ? loadingText : text}
    </button>
  );
}
