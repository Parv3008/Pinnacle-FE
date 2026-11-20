import { forwardRef, useCallback, useId, useMemo, useRef, useState } from 'react';
import ReactSelect, { components as selectComponents } from 'react-select';
import { ChevronDown, Loader2, Plus, X } from 'lucide-react';
import { useRoleMutations, useRoleOptions } from '../../hooks/useRoles.js';
import { cn, getErrorMessage } from '../../utils/helpers.js';

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

const MenuWithCreateFooter = (props) => {
  const {
    customRole,
    onCustomRoleChange,
    createError,
    onCreateRole,
    creating,
    onFooterInteract,
  } = props.selectProps;

  return (
    <selectComponents.Menu {...props}>
      {props.children}
      <div
        data-role-create-footer="true"
        className="border-t border-slate-100 bg-slate-50 p-2"
        onMouseDown={(event) => {
          // Keep the menu open, but allow the input to receive focus.
          event.stopPropagation();
          onFooterInteract?.();
        }}
      >
        <p className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Add custom role
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customRole}
            onChange={(event) => onCustomRoleChange?.(event.target.value)}
            onMouseDown={(event) => {
              event.stopPropagation();
              onFooterInteract?.();
            }}
            onClick={(event) => {
              event.stopPropagation();
              onFooterInteract?.();
            }}
            onKeyDown={(event) => {
              event.stopPropagation();
              if (event.key === 'Enter') {
                event.preventDefault();
                onCreateRole?.();
              }
              if (event.key === 'Escape') {
                event.preventDefault();
              }
            }}
            placeholder="e.g. CNC Operator"
            className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            disabled={creating}
            autoComplete="off"
          />
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onFooterInteract?.();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onCreateRole?.();
            }}
            disabled={creating || !String(customRole || '').trim()}
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg bg-primary-600 px-3 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add
          </button>
        </div>
        {createError ? <p className="mt-1.5 px-1 text-xs text-red-600">{createError}</p> : null}
      </div>
    </selectComponents.Menu>
  );
};

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
    maxHeight: 220,
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

const RoleSelect = forwardRef(function RoleSelect(
  {
    label = 'Role',
    error,
    placeholder = 'Select role',
    className = '',
    id,
    name,
    value = '',
    onChange,
    onBlur,
    disabled = false,
    isClearable = false,
    enabled = true,
    existingValue = '',
  },
  ref
) {
  const reactId = useId();
  const selectId = id || name || reactId;
  const [customRole, setCustomRole] = useState('');
  const [createError, setCreateError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const keepMenuOpenRef = useRef(false);

  const rolesQuery = useRoleOptions(enabled);
  const { create } = useRoleMutations();

  const options = useMemo(() => {
    const list = normalizeOptions(
      (rolesQuery.data?.data || []).map((role) => ({
        value: role.name,
        label: role.name,
      }))
    );

    const current = String(existingValue || value || '').trim();
    if (current && !list.some((option) => option.value.toLowerCase() === current.toLowerCase())) {
      list.unshift({ value: current, label: `${current} (existing)` });
    }

    return list;
  }, [rolesQuery.data, existingValue, value]);

  const selected =
    value === '' || value == null
      ? null
      : options.find((option) => String(option.value) === String(value)) || {
          value: String(value),
          label: String(value),
        };

  const emitChange = useCallback(
    (nextValue) => {
      if (!onChange) return;
      onChange({
        target: { name: name || '', value: nextValue },
        currentTarget: { name: name || '', value: nextValue },
        type: 'change',
      });
    },
    [name, onChange]
  );

  const handleCustomRoleChange = useCallback((nextValue) => {
    setCustomRole(nextValue);
    setCreateError('');
  }, []);

  const handleFooterInteract = useCallback(() => {
    keepMenuOpenRef.current = true;
    setMenuOpen(true);
  }, []);

  const handleCreateRole = useCallback(async () => {
    const nameValue = customRole.trim().replace(/\s+/g, ' ');
    if (!nameValue) {
      setCreateError('Enter a role name');
      keepMenuOpenRef.current = true;
      setMenuOpen(true);
      return;
    }

    const existing = options.find(
      (option) => option.value.toLowerCase() === nameValue.toLowerCase()
    );
    if (existing) {
      emitChange(existing.value);
      setCustomRole('');
      setCreateError('');
      keepMenuOpenRef.current = false;
      setMenuOpen(false);
      return;
    }

    setCreateError('');
    keepMenuOpenRef.current = true;
    try {
      const role = await create.mutateAsync({ name: nameValue, status: 'Active' });
      emitChange(role.name);
      setCustomRole('');
      keepMenuOpenRef.current = false;
      setMenuOpen(false);
    } catch (err) {
      setCreateError(getErrorMessage(err, 'Failed to add role'));
      keepMenuOpenRef.current = true;
      setMenuOpen(true);
    }
  }, [create, customRole, emitChange, options]);

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
        options={options}
        value={selected}
        onChange={(option) => {
          keepMenuOpenRef.current = false;
          emitChange(option?.value ?? '');
        }}
        onBlur={onBlur}
        placeholder={placeholder}
        isDisabled={disabled}
        isClearable={isClearable}
        isSearchable
        isLoading={rolesQuery.isLoading || create.isPending}
        menuIsOpen={menuOpen}
        onMenuOpen={() => setMenuOpen(true)}
        onMenuClose={() => {
          if (keepMenuOpenRef.current) {
            keepMenuOpenRef.current = false;
            setMenuOpen(true);
            return;
          }
          setMenuOpen(false);
          setCreateError('');
        }}
        closeMenuOnSelect
        blurInputOnSelect={false}
        menuPlacement="auto"
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        classNamePrefix="app-select"
        styles={buildStyles({ error: Boolean(error), isDisabled: disabled })}
        components={{
          DropdownIndicator,
          ClearIndicator,
          Menu: MenuWithCreateFooter,
        }}
        noOptionsMessage={() => 'No roles yet — add one below'}
        customRole={customRole}
        onCustomRoleChange={handleCustomRoleChange}
        createError={createError}
        onCreateRole={handleCreateRole}
        creating={create.isPending}
        onFooterInteract={handleFooterInteract}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default RoleSelect;
