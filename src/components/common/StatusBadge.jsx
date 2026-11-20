const toneMap = {
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
  Futurities: 'bg-teal-50 text-teal-700 ring-teal-200',
  Completed: 'bg-blue-50 text-blue-700 ring-blue-200',
  'Not Connected': 'bg-slate-100 text-slate-600 ring-slate-200',
  'Not Picking Up': 'bg-amber-50 text-amber-700 ring-amber-200',
  'Call Back Later': 'bg-orange-50 text-orange-700 ring-orange-200',
  Interested: 'bg-sky-50 text-sky-700 ring-sky-200',
  'Ready for Interview': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Interview Scheduled': 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  'Not Interested': 'bg-red-50 text-red-700 ring-red-200',
  'Joined Elsewhere': 'bg-slate-100 text-slate-600 ring-slate-200',
  'Wrong Number': 'bg-red-50 text-red-700 ring-red-200',
  Available: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Placed: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  'Currently Working': 'bg-amber-50 text-amber-700 ring-amber-200',
  'Notice Period': 'bg-orange-50 text-orange-700 ring-orange-200',
  'Not Available': 'bg-slate-100 text-slate-600 ring-slate-200',
  Joined: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Selected: 'bg-blue-50 text-blue-700 ring-blue-200',
  'Offer Accepted': 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  Rejected: 'bg-red-50 text-red-700 ring-red-200',
  Withdrawn: 'bg-slate-100 text-slate-600 ring-slate-200',
  'On Hold': 'bg-amber-50 text-amber-700 ring-amber-200',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  'Not Joined': 'bg-red-50 text-red-700 ring-red-200',
  Cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export default function StatusBadge({ status }) {
  if (!status) return <span className="text-slate-400">—</span>;
  const tone = toneMap[status] || 'bg-slate-100 text-slate-700 ring-slate-200';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tone}`}
    >
      {status}
    </span>
  );
}
