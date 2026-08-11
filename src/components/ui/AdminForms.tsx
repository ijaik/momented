import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}
export function FormInput({ className = "", ...props }: FormInputProps) {
  return (
    <input
      className={`border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 bg-transparent text-zinc-900 dark:text-white ${className}`}
      {...props}
    />
  );
}
export interface FormTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}
export function FormTextarea({ className = "", ...props }: FormTextareaProps) {
  return (
    <textarea
      className={`border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 bg-transparent text-zinc-900 dark:text-white ${className}`}
      {...props}
    />
  );
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
    <select
      className={`border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 bg-transparent text-zinc-900 dark:text-white ${className}`}
      {...props}
    >
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
      type="submit"
      disabled={isLoading}
      className={`py-3 px-6 rounded-lg font-medium disabled:opacity-50 transition-colors ${className}`}
      {...props}
    >
      {isLoading ? loadingText : text}
    </button>
  );
}
