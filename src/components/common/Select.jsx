import { forwardRef, useId, useMemo } from 'react';
import ReactSelect, { components as selectComponents } from 'react-select';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '../../utils/helpers.js';

const normalizeOptions = (options = []) =>
  options.map((option) => {
    if (typeof option === 'string' || typeof option === 'number') {
      return { value: String(option), label: String(option) };
    }
    return {
      value: String(option.value),
      label: option.label ?? String(option.value),
      isDisabled: Boolean(option.isDisabled),
    };
  });

const DropdownIndicator = (props) => (
  <selectComponents.DropdownIndicator {...props}>
    <ChevronDown size={16} className="text-slate-400" />
  </selectComponents.DropdownIndicator>
);

const ClearIndicator = (props) => (
  <selectComponents.ClearIndicator {...props}>
    <X size={14} className="text-slate-400 hover:text-slate-600" />
  </selectComponents.ClearIndicator>
);

const buildStyles = ({ error, isDisabled }) => ({
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    height: 40,
    borderRadius: 8,
    borderColor: error
      ? state.isFocused
        ? '#ef4444'
        : '#f87171'
      : state.isFocused
        ? '#6366f1'
        : '#e2e8f0',
    boxShadow: state.isFocused
      ? error
        ? '0 0 0 2px #fee2e2'
        : '0 0 0 2px #e0e7ff'
      : 'none',
    backgroundColor: isDisabled ? '#f8fafc' : '#ffffff',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    '&:hover': {
      borderColor: error ? '#f87171' : state.isFocused ? '#6366f1' : '#cbd5e1',
    },
    transition: 'border-color 120ms ease, box-shadow 120ms ease',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 12px',
    height: 38,
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    color: '#0f172a',
    fontSize: 14,
  }),
  singleValue: (base) => ({
    ...base,
    color: '#0f172a',
    fontSize: 14,
    margin: 0,
  }),
  placeholder: (base) => ({
    ...base,
    color: '#94a3b8',
    fontSize: 14,
    margin: 0,
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: 38,
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '0 10px',
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: '0 6px',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
    overflow: 'hidden',
    zIndex: 60,
    marginTop: 6,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 80,
  }),
  menuList: (base) => ({
    ...base,
    padding: 6,
    maxHeight: 260,
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: 8,
    fontSize: 14,
    padding: '10px 12px',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    backgroundColor: state.isSelected
      ? '#4f46e5'
      : state.isFocused
        ? '#eef2ff'
        : 'transparent',
    color: state.isSelected ? '#ffffff' : state.isDisabled ? '#94a3b8' : '#0f172a',
    ':active': {
      backgroundColor: state.isSelected ? '#4f46e5' : '#e0e7ff',
    },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    fontSize: 14,
    color: '#64748b',
  }),
});

const Select = forwardRef(function Select(
  {
    label,
    error,
    options = [],
    placeholder = 'Select...',
    className = '',
    id,
    name,
    value = '',
    defaultValue,
    onChange,
    onBlur,
    disabled = false,
    isClearable = false,
    isSearchable = true,
    isLoading = false,
    menuPlacement = 'auto',
    menuPortalTarget,
  },
  ref
) {
  const reactId = useId();
  const selectId = id || name || reactId;
  const normalized = useMemo(() => normalizeOptions(options), [options]);

  const resolvedValue = value === undefined || value === null ? defaultValue ?? '' : value;
  const selected =
    resolvedValue === '' || resolvedValue === undefined || resolvedValue === null
      ? null
      : normalized.find((option) => String(option.value) === String(resolvedValue)) || null;

  const emitChange = (nextValue) => {
    if (!onChange) return;
    onChange({
      target: { name: name || '', value: nextValue },
      currentTarget: { name: name || '', value: nextValue },
      type: 'change',
    });
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <ReactSelect
        inputId={selectId}
        instanceId={selectId}
        name={name}
        ref={ref}
        options={normalized}
        value={selected}
        onChange={(option) => emitChange(option?.value ?? '')}
        onBlur={onBlur}
        placeholder={placeholder}
        isDisabled={disabled}
        isClearable={isClearable}
        isSearchable={isSearchable}
        isLoading={isLoading}
        menuPlacement={menuPlacement}
        menuPortalTarget={
          menuPortalTarget === undefined && typeof document !== 'undefined'
            ? document.body
            : menuPortalTarget
        }
        menuPosition="fixed"
        classNamePrefix="app-select"
        styles={buildStyles({ error: Boolean(error), isDisabled: disabled })}
        components={{ DropdownIndicator, ClearIndicator }}
        noOptionsMessage={() => 'No options'}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Select;
