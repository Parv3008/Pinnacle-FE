export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
