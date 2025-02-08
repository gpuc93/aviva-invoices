import * as React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import '../assets/css/invoiceCustomerSelector.css';
import { Customer } from '../models/shared-models';
import CustomerDialog from './customerSelectorDialog';
import { useField, useFormikContext } from 'formik';
import { Typography } from '@mui/material';

interface InvoiceCustomerProps {
  name: string;
  label: string;
  customers: Customer[];
  isFormik?: boolean;
  handleSelect?: (customer: Customer) => void;
}

const InvoiceCustomerSelector: React.FC<InvoiceCustomerProps> = ({
  name,
  label,
  customers,
  isFormik = false,
}) => {
  const [open, setOpen] = React.useState(false);

  const formik = isFormik ? useFormikContext<any>() : null;
  const [field, meta, helpers] = isFormik ? useField(name) : [{} as any, {} as any, {} as any];

  const handleCustomerSelect = (customer: Customer) => {
    if (isFormik && formik) {
      helpers.setValue(customer.id || '');
      helpers.setTouched(true);
  
      if (name === "customerToId") {
        formik.setFieldValue("customerToFullName", customer.name || '');
      }
    }
  };
  
  const customerData = isFormik
    ? customers.find((c) => c.id === field.value)
    : null;

  return (
    <div className='invcustsel__from-to--content'>
      <div className='invcustsel__from-to--row'>
        <label className='invcustsel__label'>{label}:</label>
        {customerData ? (
          <span className='invcustsel__icon' onClick={() => setOpen(!open)}><EditIcon /></span>
        ) : (
          <span className='invcustsel__icon' onClick={() => setOpen(!open)}><AddIcon /></span>
        )}
      </div>
      <label className='invcustsel__label--info'>{customerData?.name}</label>
      <label className='invcustsel__label--seconday-info'>{customerData?.address}</label>
      <label className='invcustsel__label--seconday-info'>{customerData?.phone}</label>

      <CustomerDialog 
        open={open} 
        onClose={() => setOpen(false)} 
        customers={customers} 
        handleSelect={handleCustomerSelect} 
        currentCustomer={customerData || undefined} 
      />

      {(isFormik && meta.error && !customerData) && (
        <Typography width="100%" color='error'>
            {typeof meta.error === "string" ? meta.error : "Error de validación"}
        </Typography>
      )}
    </div>
  );
};

export default InvoiceCustomerSelector;