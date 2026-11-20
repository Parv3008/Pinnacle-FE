import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../../components/common/Modal.jsx';
import Input from '../../../components/common/Input.jsx';
import Select from '../../../components/common/Select.jsx';
import Button from '../../../components/common/Button.jsx';
import { COMPANY_STATUSES } from '../../../utils/constants.js';
import { formatDate } from '../../../utils/formatters.js';

const schema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  status: z.enum(['Active', 'Inactive']),
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactNumber: z.string().min(1, 'Contact number is required'),
});

const defaults = {
  companyName: '',
  status: 'Active',
  contactPerson: '',
  contactNumber: '',
};

export default function CompanyForm({ open, onClose, initialData, onSubmit, loading }) {
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
    if (open) {
      reset(
        initialData
          ? {
              companyName: initialData.companyName || '',
              status: initialData.status || 'Active',
              contactPerson: initialData.contactPerson || '',
              contactNumber: initialData.contactNumber || '',
            }
          : defaults
      );
    }
  }, [open, initialData, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Company' : 'Add Company'}
      size="md"
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
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <div className="sm:col-span-2">
          <Input
            label="Company Name *"
            error={errors.companyName?.message}
            {...register('companyName')}
          />
        </div>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              label="Status *"
              options={COMPANY_STATUSES}
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
        <Input
          label="Contact Person *"
          error={errors.contactPerson?.message}
          {...register('contactPerson')}
        />
        <Input
          label="Contact Number *"
          error={errors.contactNumber?.message}
          {...register('contactNumber')}
        />
        {initialData?.createdAt && (
          <Input label="Created Date" value={formatDate(initialData.createdAt)} disabled readOnly />
        )}
      </form>
    </Modal>
  );
}
