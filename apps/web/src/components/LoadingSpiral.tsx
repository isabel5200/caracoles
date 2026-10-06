export function LoadingSpiral() {
  return (
    <svg
      className="h-5 w-5 shrink-0 animate-spin motion-reduce:animate-none"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 16c-2-2-5 0-4 3 1 3 6 4 9 1 4-4 1-11-5-12-7-1-13 5-12 12 1 8 9 13 17 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
