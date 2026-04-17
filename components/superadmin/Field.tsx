import clsx from "clsx";

export function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={clsx("block space-y-1.5", className)}>
      <span className="text-xs font-medium text-[var(--text-2)]">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-[var(--text-3)]">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-[var(--r-input)] border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-1)] outline-none ring-[var(--border-focus)] placeholder:text-[var(--text-3)] focus:border-[var(--border-focus)] focus:ring-2";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(inputClass, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(inputClass, "min-h-[88px] resize-y", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx(inputClass, props.className)} />;
}
