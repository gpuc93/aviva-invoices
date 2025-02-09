import React, { useState, useEffect, useCallback } from 'react';
import { InputAdornment, TextField } from '@mui/material';
import { useField, useFormikContext } from 'formik';

interface FormikTextFieldProps {
  name: string;
  label: string;
  type?: string;
  fullWidth?: boolean;
  debounceTime?: number;
  size?: 'small' | 'medium';
  disabled?: boolean;
  multiline?: boolean;
  maxRows?: number;
  isAmount?: boolean
}

export const FormikTextField: React.FC<FormikTextFieldProps> = ({
  name,
  label,
  type = 'text',
  fullWidth = true,
  debounceTime = 500,
  size = "medium",
  disabled = false,
  multiline = false,
  maxRows = 0,
  isAmount = false,
}) => {
  const { setFieldValue } = useFormikContext<any>();
  const [field, meta] = useField(name);
  const [localValue, setLocalValue] = useState(field.value);

  useEffect(() => {
    setLocalValue(field.value);
  }, [field.value]);

  const debouncedSetFieldValue = useCallback(
    (value: string) => {
      const handler = setTimeout(() => {
        setFieldValue(name, value);
      }, debounceTime);

      return () => clearTimeout(handler);
    },
    [name, setFieldValue, debounceTime]
  );

  useEffect(() => {
    if (localValue !== field.value) {
      const cleanup = debouncedSetFieldValue(localValue);
      return cleanup;
    }
  }, [localValue, debouncedSetFieldValue]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(event.target.value);
  };

  return (
    <TextField
      disabled={disabled}
      {...field}
      size={size}
      fullWidth={fullWidth}
      label={label}
      type={type}
      multiline={multiline}
      maxRows={maxRows}
      value={localValue}
      onChange={handleChange}
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error}
      slotProps={isAmount ? {
        input: {
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        },
      } : {}}
    />
  );
};
