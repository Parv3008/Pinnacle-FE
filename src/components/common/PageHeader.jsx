export default function PageHeader({ title, subtitle, breadcrumbs = [], actions }) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:mb-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        {breadcrumbs.length > 0 && (
          <div className="mb-1.5 flex flex-wrap items-center gap-1 text-xs text-slate-500">
            {breadcrumbs.map((item, index) => (
              <span key={`${item}-${index}`} className="flex max-w-full items-center gap-1">
                {index > 0 && <span className="text-slate-300">/</span>}
                <span
                  className={`truncate ${
                    index === breadcrumbs.length - 1 ? 'font-medium text-slate-700' : ''
                  }`}
                >
                  {item}
                </span>
              </span>
            ))}
          </div>
        )}
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:max-w-xl lg:justify-end [&_button]:min-w-[calc(50%-0.25rem)] [&_button]:flex-1 sm:[&_button]:min-w-0 sm:[&_button]:flex-none">
          {actions}
        </div>
      )}
    </div>
  );
}
