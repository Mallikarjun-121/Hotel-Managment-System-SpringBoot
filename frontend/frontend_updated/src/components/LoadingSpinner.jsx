const SIZES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
};

export default function LoadingSpinner({ size = 'md', label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status">
      <span
        className={`${SIZES[size]} rounded-full border-meridian-200 border-t-brass-500 animate-spin`}
        aria-hidden="true"
      />
      {label && <span className="text-sm text-paper-700">{label}</span>}
      <span className="sr-only">Loading</span>
    </div>
  );
}
