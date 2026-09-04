import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const baseInputStyle =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-faint transition-colors hover:border-ink/25";
export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}
export function FormInput({ className = "", ...props }: FormInputProps) {
  return <input className={`${baseInputStyle} ${className}`} {...props} />;
}
export interface FormTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}
export function FormTextarea({ className = "", ...props }: FormTextareaProps) {
  return <textarea className={`${baseInputStyle} ${className}`} {...props} />;
}
export interface FormSelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
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
export interface SubmitButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: ReactNode;
  text: ReactNode;
  className?: string;
}
export function SubmitButton({
  isLoading,
  loadingText,
  text,
  className = "",
  ...props
}: SubmitButtonProps) {
  return (
    <button
      {...props}
      type="submit"
      disabled={isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-solid px-5 py-2.5 text-sm font-medium text-on-solid transition-opacity hover:opacity-85 disabled:pointer-events-none disabled:opacity-60 ${className}`}
    >
      {isLoading ? loadingText : text}
    </button>
  );
}
