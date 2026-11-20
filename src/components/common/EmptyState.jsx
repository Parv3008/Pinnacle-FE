import { Inbox } from 'lucide-react';
import Button from './Button.jsx';

export default function EmptyState({
  title = 'No data found',
  description = 'Try adjusting your filters or create a new record.',
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
      <div className="mb-3 rounded-full bg-slate-50 p-3 text-slate-400">
        <Icon size={24} />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
