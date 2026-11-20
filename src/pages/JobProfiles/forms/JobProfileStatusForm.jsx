import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../../components/common/Modal.jsx';
import Button from '../../../components/common/Button.jsx';
import Select from '../../../components/common/Select.jsx';
import { JOB_PROFILE_STATUSES } from '../../../utils/constants.js';

const statusSchema = z.object({
  status: z.enum(JOB_PROFILE_STATUSES),
});

export default function JobProfileStatusForm({
  open,
  onClose,
  currentStatus = 'Active',
  onSubmit,
  loading,
}) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(statusSchema),
    defaultValues: { status: currentStatus || 'Active' },
  });

  useEffect(() => {
    if (open) {
      reset({ status: currentStatus || 'Active' });
    }
  }, [open, currentStatus, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change Job Profile Status"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit((values) => onSubmit?.(values.status))} loading={loading}>
            Update Status
          </Button>
        </>
      }
    >
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Select
            label="Status"
            options={JOB_PROFILE_STATUSES}
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
    </Modal>
  );
}
