import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

interface FieldLabelProps {
  htmlFor: string;
  children: ReactNode;
}
export function FieldLabel({ htmlFor, children }: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-ink"
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
export function FormInput({ className = "", ...props }: FormInputProps) {
  return <input className={`${baseInputStyle} ${className}`} {...props} />;
}
interface FormTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}
export function FormTextarea({ className = "", ...props }: FormTextareaProps) {
  return <textarea className={`${baseInputStyle} ${className}`} {...props} />;
}
interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  children?: ReactNode;
}
export function FormSelect({
  children,
  className = "",
  ...props
}: FormSelectProps) {
  return (
    <select className={`${baseInputStyle} ${className}`} {...props}>
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
    sm: "px-3.5 py-2 text-sm gap-1.5 rounded-xl",
    md: "px-5 py-2.5 text-sm gap-2 rounded-xl",
  };
  return (
    <button
      {...props}
      type="submit"
      disabled={isLoading || props.disabled}
      className={`inline-flex items-center justify-center font-medium bg-solid text-on-solid shadow-xs transition-all duration-100 ease-out hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:ring-offset-2 ${sizes[size]} ${className}`}
    >
      {isLoading ? loadingText : text}
    </button>
  );
}
