import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  Users,
  UserCheck,
  DoorOpen,
  PhoneCall,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  IndianRupee,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  LabelList,
} from 'recharts';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Select from '../../components/common/Select.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import {
  useDashboardOverview,
  useHiringStats,
  useTradeStats,
  useRecentActivities,
} from '../../hooks/useDashboard.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';
import { cn } from '../../utils/helpers.js';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];

function StatCard({ label, value, hint, icon: Icon, tone = 'indigo', to }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    slate: 'bg-slate-100 text-slate-700',
  };

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value ?? 0}</p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <div className={`rounded-xl p-2.5 ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
      {to ? (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-600">
          View details
          <ArrowUpRight size={13} />
        </div>
      ) : null}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">{content}</div>
  );
}

function ChartCard({ title, description, children, empty, action }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {description ? <p className="mt-0.5 text-sm text-slate-500">{description}</p> : null}
        </div>
        {action}
      </div>
      {empty ? (
        <EmptyState title="No data yet" description="Charts will appear once records exist." />
      ) : (
        children
      )}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-slate-800">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-slate-600">
          <span className="font-medium" style={{ color: entry.color || entry.fill }}>
            {entry.name || entry.dataKey}:
          </span>{' '}
          {entry.value}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [companyFilter, setCompanyFilter] = useState('');

  const overviewQuery = useDashboardOverview();
  const hiringStatsQuery = useHiringStats();
  const tradeStatsQuery = useTradeStats();
  const activitiesQuery = useRecentActivities();

  const overview = overviewQuery.data;
  const hiringStats = hiringStatsQuery.data;
  const tradeStats = tradeStatsQuery.data;
  const activities = activitiesQuery.data || [];

  const companySnapshot = hiringStats?.companySnapshot || hiringStats?.companyWise || [];
  const allJobProfiles = hiringStats?.jobProfiles || hiringStats?.vacancyByRole || [];

  const companyOptions = useMemo(
    () =>
      companySnapshot.map((item) => ({
        value: item.companyId,
        label: item.name,
      })),
    [companySnapshot]
  );

  const filteredCompanies = useMemo(() => {
    if (!companyFilter) return companySnapshot;
    return companySnapshot.filter((item) => item.companyId === companyFilter);
  }, [companySnapshot, companyFilter]);

  const roleTotals = useMemo(() => {
    const source = companyFilter
      ? allJobProfiles.filter((item) => item.companyId === companyFilter)
      : allJobProfiles;

    const map = new Map();
    source.forEach((item) => {
      const roleName = (item.role || 'Untitled').trim() || 'Untitled';
      const key = roleName.toLowerCase();
      const required = Number(item.required) || 0;
      const hired = Number(item.hired) || 0;
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          role: roleName,
          required,
          hired,
          profiles: 1,
          companyIds: item.companyId ? [item.companyId] : [],
          companyNames: item.companyName ? [item.companyName] : [],
        });
        return;
      }

      existing.required += required;
      existing.hired += hired;
      existing.profiles += 1;
      if (item.companyId && !existing.companyIds.includes(item.companyId)) {
        existing.companyIds.push(item.companyId);
      }
      if (item.companyName && !existing.companyNames.includes(item.companyName)) {
        existing.companyNames.push(item.companyName);
      }
    });

    return Array.from(map.values())
      .map((item) => {
        const remaining = Math.max(item.required - item.hired, 0);
        const fillRate =
          item.required > 0 ? Math.round((item.hired / item.required) * 100) : 0;
        const companyName =
          item.companyNames.length > 1
            ? `${item.companyNames.length} companies`
            : item.companyNames[0] || '—';

        return {
          ...item,
          remaining,
          fillRate,
          companyName,
          companyId: item.companyIds.length === 1 ? item.companyIds[0] : '',
          label: item.role.length > 18 ? `${item.role.slice(0, 18)}…` : item.role,
        };
      })
      .sort((a, b) => b.remaining - a.remaining || b.required - a.required);
  }, [allJobProfiles, companyFilter]);

  const filteredJobs = useMemo(() => roleTotals.slice(0, 12), [roleTotals]);

  const companyChartData = useMemo(
    () =>
      filteredCompanies.map((item) => ({
        ...item,
        label: item.name?.length > 16 ? `${item.name.slice(0, 16)}…` : item.name,
      })),
    [filteredCompanies]
  );

  const jobChartData = filteredJobs;

  const selectedCompany = useMemo(
    () => companySnapshot.find((item) => item.companyId === companyFilter) || null,
    [companySnapshot, companyFilter]
  );

  const loading =
    overviewQuery.isLoading ||
    hiringStatsQuery.isLoading ||
    tradeStatsQuery.isLoading ||
    activitiesQuery.isLoading;

  if (loading) return <Loader label="Loading dashboard..." />;

  if (overviewQuery.isError) {
    return (
      <EmptyState
        title="Failed to load dashboard"
        description={overviewQuery.error?.message || 'Please try again later.'}
      />
    );
  }

  const profilePie = tradeStats?.profileStatus || [];
  const calledByPie = tradeStats?.calledByStats || [];
  const roleWiseHiring = tradeStats?.roleWiseHiring || tradeStats?.tradeWiseHiring || [];
  const experienceBars = tradeStats?.experienceStats || [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Companies, roles, vacancies, candidates & hirings"
        breadcrumbs={['Admin', 'Dashboard']}
        actions={
          <>
            <Link to="/job-listing">
              <Button variant="secondary">
                <Plus size={16} />
                Add Company
              </Button>
            </Link>
            <Link to="/candidates">
              <Button variant="secondary">
                <Plus size={16} />
                Add Candidate
              </Button>
            </Link>
            <Link to="/hirings">
              <Button>
                <Plus size={16} />
                Add Hiring
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Total Companies"
          value={overview.totalCompanies}
          hint="Open company listing"
          icon={Building2}
          to="/job-listing"
        />
        <StatCard
          label="Job Profiles"
          value={overview.totalJobProfiles}
          hint={`${overview.activeJobProfiles || 0} active · ${overview.completedJobProfiles || 0} completed`}
          icon={Briefcase}
          tone="blue"
          to="/job-listing"
        />
        <StatCard
          label="Active Profiles"
          value={overview.activeJobProfiles}
          hint="Roles currently hiring"
          icon={CheckCircle2}
          tone="green"
          to="/job-listing"
        />
        <StatCard
          label="Open Vacancies"
          value={overview.openVacancies}
          hint="Seats still to fill"
          icon={DoorOpen}
          tone="amber"
          to="/job-listing"
        />
        <StatCard
          label="Total Profile Salary"
          value={formatCurrency(overview.totalJobProfileSalary || 0)}
          hint="Sum of salary band lows (e.g. 15k from ₹15–20k)"
          icon={IndianRupee}
          tone="green"
          to="/job-listing"
        />
        <StatCard
          label="Total Candidates"
          value={overview.totalCandidates}
          hint="Open candidate list"
          icon={Users}
          tone="slate"
          to="/candidates"
        />
        <StatCard
          label="Total Hired"
          value={overview.totalHired}
          hint="Joined candidates"
          icon={UserCheck}
          tone="green"
          to="/hirings"
        />
        <StatCard
          label="Called by Parv"
          value={overview.calledByParv}
          hint="Filter Parv's calls"
          icon={PhoneCall}
          tone="indigo"
          to="/candidates?calledBy=Parv"
        />
        <StatCard
          label="Called by Dhruv"
          value={overview.calledByDhruv}
          hint="Filter Dhruv's calls"
          icon={PhoneCall}
          tone="blue"
          to="/candidates?calledBy=Dhruv"
        />
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Company pulse</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Filter by company to inspect hiring progress and open roles instantly.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:min-w-[320px]">
            <Select
              options={companyOptions}
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              placeholder="All companies"
              isClearable
              isSearchable
            />
            {selectedCompany ? (
              <Button
                variant="secondary"
                onClick={() => navigate(`/job-listing/companies/${selectedCompany.companyId}`)}
              >
                Open company
              </Button>
            ) : null}
          </div>
        </div>

        {selectedCompany ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {[
              { label: 'Profiles', value: selectedCompany.profiles },
              { label: 'Active', value: selectedCompany.activeProfiles },
              { label: 'Required', value: selectedCompany.required },
              { label: 'Hired', value: selectedCompany.hired },
              { label: 'Open seats', value: selectedCompany.remaining },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {item.label}
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{item.value ?? 0}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Company-wise hiring vs open seats"
          description="Hired seats vs remaining vacancies by company"
          empty={!companyChartData.length}
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={companyChartData}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={110}
                  tick={{ fontSize: 11, fill: '#475569' }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar
                  dataKey="hired"
                  name="Hired"
                  stackId="a"
                  fill="#10b981"
                  cursor="pointer"
                  onClick={(data) => {
                    const companyId = data?.payload?.companyId || data?.companyId;
                    if (companyId) navigate(`/job-listing/companies/${companyId}`);
                  }}
                />
                <Bar
                  dataKey="remaining"
                  name="Open seats"
                  stackId="a"
                  fill="#f59e0b"
                  radius={[0, 6, 6, 0]}
                  cursor="pointer"
                  onClick={(data) => {
                    const companyId = data?.payload?.companyId || data?.companyId;
                    if (companyId) navigate(`/job-listing/companies/${companyId}`);
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Role-wise hiring vs open seats"
          description={
            companyFilter
              ? 'Totals per role for the selected company'
              : 'Each role once — totals across all matching job profiles'
          }
          empty={!jobChartData.length}
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={jobChartData}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={120}
                  tick={{ fontSize: 11, fill: '#475569' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0]?.payload;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
                        <p className="font-semibold text-slate-800">{row.role}</p>
                        <p className="text-slate-500">
                          {row.companyName}
                          {row.profiles > 1 ? ` · ${row.profiles} profiles` : ''}
                        </p>
                        <p className="mt-1 text-slate-600">
                          Hired {row.hired}/{row.required} · Open {row.remaining} · Fill{' '}
                          {row.fillRate}%
                        </p>
                      </div>
                    );
                  }}
                />
                <Legend />
                <Bar dataKey="hired" name="Hired" stackId="role" fill="#10b981" />
                <Bar
                  dataKey="remaining"
                  name="Open seats"
                  stackId="role"
                  fill="#f59e0b"
                  radius={[0, 6, 6, 0]}
                >
                  <LabelList
                    dataKey="fillRate"
                    position="right"
                    formatter={(v) => `${v}%`}
                    style={{ fill: '#64748b', fontSize: 11 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Company snapshot</h3>
            <p className="text-sm text-slate-500">
              Direct view of profiles, hiring and open seats — click a row to open the company.
            </p>
          </div>
          <p className="text-xs text-slate-500">
            {filteredCompanies.length} compan{filteredCompanies.length === 1 ? 'y' : 'ies'}
          </p>
        </div>
        {filteredCompanies.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No companies yet" description="Add a company to see snapshot data." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Profiles</th>
                  <th className="px-4 py-3 font-medium">Active</th>
                  <th className="px-4 py-3 font-medium">Required</th>
                  <th className="px-4 py-3 font-medium">Hired</th>
                  <th className="px-4 py-3 font-medium">Open</th>
                  <th className="px-4 py-3 font-medium">Fill</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((row) => (
                  <tr
                    key={row.companyId}
                    className="cursor-pointer border-t border-slate-100 transition hover:bg-indigo-50/40"
                    onClick={() => navigate(`/job-listing/companies/${row.companyId}`)}
                  >
                    <td className="px-5 py-3 font-medium text-slate-900">{row.name}</td>
                    <td className="px-4 py-3 text-slate-700">{row.profiles}</td>
                    <td className="px-4 py-3 text-slate-700">{row.activeProfiles ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{row.required}</td>
                    <td className="px-4 py-3 text-emerald-700">{row.hired}</td>
                    <td className="px-4 py-3 text-amber-700">{row.remaining}</td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-[110px] items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${Math.min(row.fillRate || 0, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">
                          {row.fillRate || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={row.companyStatus || 'Active'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredJobs.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-base font-semibold text-slate-900">Roles needing attention</h3>
            <p className="text-sm text-slate-500">
              One row per role with combined required, hired and open seats.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Companies</th>
                  <th className="px-4 py-3 font-medium">Profiles</th>
                  <th className="px-4 py-3 font-medium">Required</th>
                  <th className="px-4 py-3 font-medium">Hired</th>
                  <th className="px-4 py-3 font-medium">Open</th>
                  <th className="px-5 py-3 font-medium">Fill</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((row) => (
                  <tr
                    key={row.role.toLowerCase()}
                    className={cn(
                      'border-t border-slate-100',
                      row.companyId
                        ? 'cursor-pointer transition hover:bg-indigo-50/40'
                        : ''
                    )}
                    onClick={() => {
                      if (row.companyId) {
                        navigate(`/job-listing/companies/${row.companyId}`);
                      }
                    }}
                  >
                    <td className="px-5 py-3 font-medium text-slate-900">{row.role}</td>
                    <td className="px-4 py-3 text-slate-700">{row.companyName || '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{row.profiles}</td>
                    <td className="px-4 py-3 text-slate-700">{row.required}</td>
                    <td className="px-4 py-3 text-emerald-700">{row.hired}</td>
                    <td className="px-4 py-3 text-amber-700">{row.remaining}</td>
                    <td className="px-5 py-3 text-slate-700">{row.fillRate || 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ChartCard title="Role-wise hiring" empty={!roleWiseHiring.length}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleWiseHiring}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey={roleWiseHiring[0]?.role != null ? 'role' : 'trade'}
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="hired" name="Hired" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Monthly hiring trends" empty={!hiringStats?.monthlyTrends?.length}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hiringStats?.monthlyTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="hired"
                  name="Hired"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Profile status" empty={!profilePie.length}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={profilePie} dataKey="count" nameKey="status" outerRadius={100} label>
                  {profilePie.map((entry, index) => (
                    <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Called by (Parv / Dhruv)" empty={!calledByPie.length}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={calledByPie} dataKey="count" nameKey="caller" outerRadius={100} label>
                  {calledByPie.map((entry, index) => (
                    <Cell key={entry.caller} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Candidate experience" empty={!experienceBars.length}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={experienceBars}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Candidates" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Notice period distribution" empty={!tradeStats?.noticeStats?.length}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tradeStats?.noticeStats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Candidates" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Recent Activities</h3>
        </div>
        {activities.length === 0 ? (
          <EmptyState
            title="No recent activity"
            description="Actions across the admin panel will show up here."
          />
        ) : (
          <div className="space-y-3">
            {activities.map((item) => (
              <div
                key={item._id}
                className={cn(
                  'flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between'
                )}
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.description}</p>
                  <p className="text-xs capitalize text-slate-500">
                    {item.entityType} · {item.action}
                    {item.performedBy?.name ? ` · ${item.performedBy.name}` : ''}
                  </p>
                </div>
                <p className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
