import React from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useField, useFormikContext } from 'formik';
import { CategoryService } from '../models/shared-models';

interface FormikSelectFieldProps {
  name: string;
  label: string;
  options: CategoryService[];
  size?: 'small' | 'medium';
  id: string;
}

export const FormikSelectField: React.FC<FormikSelectFieldProps> = ({
  id,
  name,
  label,
  options,
  size = 'medium',
}) => {
  const { setFieldValue } = useFormikContext<any>();
  const [field, meta] = useField(name);

  return (
    <FormControl sx={{ flexGrow: 1, width: '100%' }} size={size} fullWidth error={meta.touched && Boolean(meta.error)}>
      <InputLabel id={id}>{label}</InputLabel>
      <Select
        {...field}
        labelId={id}
        id={`${id}-filter-status`}
        value={field.value || ''}
        onChange={(e) => setFieldValue(name, e.target.value)}
        label={label}
      >
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
