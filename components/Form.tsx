import React from "react";
import clsx from "clsx";

export interface FieldProps {
  label: string;
  error?: string;
}

export function Form({
  className,
  ...props
}: React.FormHTMLAttributes<HTMLFormElement>) {
  return <form className={clsx("space-y-4", className)} {...props} />;
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={clsx("text-sm font-medium", className)} {...props} />
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & FieldProps
>(({ label, error, id, className, ...props }, ref) => {
  const fieldId = id || props.name;
  const errorId = error ? `${fieldId}-error` : undefined;
  return (
    <div className="space-y-1">
      <Label htmlFor={fieldId}>{label}</Label>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={clsx(
          "block w-full rounded-md border border-gray-300 px-3 py-2 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent disabled:bg-gray-100",
          error &&
            "border-danger text-danger focus:ring-danger focus:border-danger",
          className,
        )}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
Input.displayName = "Input";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & FieldProps
>(({ label, error, id, className, children, ...props }, ref) => {
  const fieldId = id || props.name;
  const errorId = error ? `${fieldId}-error` : undefined;
  return (
    <div className="space-y-1">
      <Label htmlFor={fieldId}>{label}</Label>
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={clsx(
          "block w-full rounded-md border border-gray-300 px-3 py-2 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent disabled:bg-gray-100",
          error &&
            "border-danger text-danger focus:ring-danger focus:border-danger",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
Select.displayName = "Select";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps
>(({ label, error, id, className, ...props }, ref) => {
  const fieldId = id || props.name;
  const errorId = error ? `${fieldId}-error` : undefined;
  return (
    <div className="space-y-1">
      <Label htmlFor={fieldId}>{label}</Label>
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={clsx(
          "block w-full rounded-md border border-gray-300 px-3 py-2 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent disabled:bg-gray-100",
          error &&
            "border-danger text-danger focus:ring-danger focus:border-danger",
          className,
        )}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
Textarea.displayName = "Textarea";

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & FieldProps
>(({ label, error, id, className, ...props }, ref) => {
  const fieldId = id || props.name;
  const errorId = error ? `${fieldId}-error` : undefined;
  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          ref={ref}
          id={fieldId}
          aria-describedby={errorId}
          className={clsx(
            "rounded border-gray-300 text-accent focus:ring-accent disabled:bg-gray-100",
            error && "border-danger text-danger focus:ring-danger",
            className,
          )}
          {...props}
        />
        <Label htmlFor={fieldId} className="mb-0">
          {label}
        </Label>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
Checkbox.displayName = "Checkbox";

export const Radio = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & FieldProps
>(({ label, error, id, className, ...props }, ref) => {
  const fieldId = id || props.name;
  const errorId = error ? `${fieldId}-error` : undefined;
  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          ref={ref}
          id={fieldId}
          aria-describedby={errorId}
          className={clsx(
            "border-gray-300 text-accent focus:ring-accent disabled:bg-gray-100",
            error && "border-danger text-danger focus:ring-danger",
            className,
          )}
          {...props}
        />
        <Label htmlFor={fieldId} className="mb-0">
          {label}
        </Label>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
Radio.displayName = "Radio";

Form.Label = Label;
Form.Input = Input;
Form.Select = Select;
Form.Textarea = Textarea;
Form.Checkbox = Checkbox;
Form.Radio = Radio;

export default Form;
