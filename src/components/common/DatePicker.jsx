import { forwardRef, useId, useMemo } from 'react';
import ReactDatePicker from 'react-datepicker';
import { CalendarDays, X } from 'lucide-react';
import { cn } from '../../utils/helpers.js';
import 'react-datepicker/dist/react-datepicker.css';

const parseValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    const local = new Date(year, month - 1, day);
    return Number.isNaN(local.getTime()) ? null : local;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toIsoDate = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DatePickerInput = forwardRef(function DatePickerInput(
  {
    value,
    onClick,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    onClear,
    disabled,
    error,
    placeholder,
    id,
    name,
    className,
    autoComplete,
    ...rest
  },
  ref
) {
  return (
    <div className="relative w-full">
      <input
        {...rest}
        ref={ref}
        id={id}
        name={name}
        type="text"
        value={value || ''}
        onClick={onClick}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        disabled={disabled}
        readOnly
        autoComplete={autoComplete || 'off'}
        placeholder={placeholder || 'Select date'}
        className={cn(
          'h-10 w-full cursor-pointer rounded-lg border bg-white px-3 pr-16 text-left text-sm outline-none transition',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
          disabled ? 'cursor-not-allowed bg-slate-50 text-slate-400' : 'text-slate-900',
          className
        )}
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
        {value && onClear ? (
          <button
            type="button"
            className="pointer-events-auto rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onClear();
            }}
            disabled={disabled}
            aria-label="Clear date"
          >
            <X size={14} />
          </button>
        ) : null}
        <span className="rounded-md p-1.5 text-slate-400">
          <CalendarDays size={16} />
        </span>
      </div>
    </div>
  );
});

const DatePicker = forwardRef(function DatePicker(
  {
    label,
    error,
    helperText,
    className = '',
    id,
    name,
    value = '',
    onChange,
    onBlur,
    disabled = false,
    placeholder = 'Select date',
    minDate,
    maxDate,
    isClearable = true,
  },
  ref
) {
  const reactId = useId();
  const inputId = id || name || reactId;
  const selected = useMemo(() => parseValue(value), [value]);

  const emitChange = (nextDate) => {
    const nextValue = nextDate ? toIsoDate(nextDate) : '';
    onChange?.({
      target: { name: name || '', value: nextValue },
      currentTarget: { name: name || '', value: nextValue },
      type: 'change',
    });
  };

  return (
    <div className={cn('app-datepicker w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <ReactDatePicker
        ref={ref}
        id={inputId}
        name={name}
        selected={selected}
        onChange={(date) => emitChange(date)}
        onBlur={onBlur}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        dateFormat="dd MMM yyyy"
        placeholderText={placeholder}
        shouldCloseOnSelect
        showPopperArrow={false}
        withPortal
        portalId="datepicker-portal"
        popperClassName="app-datepicker-popper"
        customInput={
          <DatePickerInput
            error={Boolean(error)}
            disabled={disabled}
            placeholder={placeholder}
            id={inputId}
            onClear={isClearable ? () => emitChange(null) : undefined}
          />
        }
        calendarClassName="app-datepicker-calendar"
        wrapperClassName="w-full"
      />
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default DatePicker;
