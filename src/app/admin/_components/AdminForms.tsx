import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import Button, { type ButtonProps } from "@/components/ui/Button";

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
export interface PillOption {
  id: string | number;
  title: string;
}
interface PillCheckboxGroupProps {
  name: string;
  options: PillOption[];
  selectedIds?: (string | number)[];
}
export function PillCheckboxGroup({
  name,
  options,
  selectedIds,
}: PillCheckboxGroupProps) {
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {options.map((opt) => {
        const isChecked = selectedIds
          ? selectedIds.some((id) => String(id) === String(opt.id))
          : false;
        return (
          <label
            key={opt.id}
            className="group inline-flex items-center gap-1.5 cursor-pointer rounded-full border border-line px-3 py-1 text-xs font-medium text-muted hover:bg-soft hover:text-ink has-checked:bg-solid has-checked:text-on-solid has-checked:border-solid transition-colors"
          >
            <input
              type="checkbox"
              name={name}
              value={opt.id}
              defaultChecked={isChecked}
              className="sr-only"
            />
            <span>{opt.title}</span>
          </label>
        );
      })}
    </div>
  );
}
export function SubmitButton({
  text,
  children,
  size = "sm",
  ...props
}: Omit<ButtonProps, "variant" | "children"> & {
  text?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Button type="submit" variant="primary" size={size} {...props}>
      {text || children}
    </Button>
  );
}
