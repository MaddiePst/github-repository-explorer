interface Props {
  className?: string;
  label?: string;
}

export default function Spinner({ className = "h-5 w-5", label }: Props) {
  return (
    <span className="inline-flex items-center gap-2" role="status">
      <svg
        className={`animate-spin text-current ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
        />
      </svg>
      {label && <span className="text-sm">{label}</span>}
      <span className="sr-only">Loading</span>
    </span>
  );
}
