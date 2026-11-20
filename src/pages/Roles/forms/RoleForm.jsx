import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../../components/common/Modal.jsx';
import Input from '../../../components/common/Input.jsx';
import Select from '../../../components/common/Select.jsx';
import Button from '../../../components/common/Button.jsx';
import { formatDate } from '../../../utils/formatters.js';
import { ROLE_STATUSES } from '../../../utils/constants.js';

const schema = z.object({
  name: z.string().min(1, 'Role name is required'),
  status: z.enum(['Active', 'Inactive', 'Futurities']),
});

const defaults = {
  name: '',
  status: 'Active',
};

export default function RoleForm({ open, onClose, initialData, onSubmit, loading }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      initialData
        ? {
            name: initialData.name || '',
            status: initialData.status || 'Active',
          }
        : defaults
    );
  }, [open, initialData, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Role' : 'Add Role'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button loading={loading} onClick={handleSubmit(onSubmit)}>
            {initialData ? 'Update' : 'Create'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Role Name *"
          placeholder="e.g. Fitter, QC, CNC Operator"
          error={errors.name?.message}
          {...register('name')}
        />
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              label="Status *"
              options={ROLE_STATUSES}
              placeholder="Select status"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              isClearable={false}
              isSearchable={false}
              error={errors.status?.message}
            />
          )}
        />
        <p className="text-xs text-slate-500">
          Use <span className="font-medium text-slate-700">Futurities</span> for roles kept ready
          for upcoming / future vacancies.
        </p>
        {initialData?.createdAt && (
          <Input label="Created Date" value={formatDate(initialData.createdAt)} disabled readOnly />
        )}
      </form>
    </Modal>
  );
}
