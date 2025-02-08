import React, { useEffect, useRef } from 'react';
import { FieldArray } from 'formik';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  TextField,
  Divider,
  InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { FormikTextField } from './FormikTextField';
import { FormikSelectField } from './FormikSelectField';
import '../assets/css/invoiceRowForm.css';
import { CategoryService } from '../models/shared-models';

interface InvoiceRowFormProps {
  formik: any;
  onTotalsChange: (subtotal: number, total: number) => void;
  categoryServices: CategoryService[];
}

const InvoiceRowForm: React.FC<InvoiceRowFormProps> = ({ formik, onTotalsChange, categoryServices }) => {
  const prevItemsRef = useRef([...formik.values.details]);

  useEffect(() => {
    let newSubtotal = 0;
    const updatedItems = [...formik.values.details];

    updatedItems.forEach((item) => {
      const itemTotal = item.quantity * item.price;
      newSubtotal += itemTotal;
    });

    const newTotal = newSubtotal;
    onTotalsChange(newSubtotal, newTotal);

    prevItemsRef.current = [...formik.values.details];
  }, [formik.values.details, onTotalsChange]);


  return (
    <TableContainer>
      <Table>
        <TableHead sx={{ backgroundColor: 'white' }}>
          <TableRow sx={{ backgroundColor: 'white' }}>
            <TableCell className='invrow__title' sx={{ backgroundColor: 'white !important', border: 'none', paddingTop: '0', paddingBottom: '0' }}><label className='invrowl__label'>Detalles:</label></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <FieldArray name="details">
            {({ push, remove }) => (
              <>
                {formik.values.details.map((item: any, index: number) => {
                    const total = (item.quantity * item.price).toFixed(2);
                    
                  return (
                    <React.Fragment key={index}>
                    <TableRow className="invrow__new-row" sx={{ verticalAlign: 'baseline' }}>
                      <TableCell sx={{ border: 'none' }}>
                        <FormikTextField size="small" name={`details.${index}.title`} label="Título" />
                      </TableCell>
                      <TableCell sx={{ border: 'none' }}>
                        <FormikTextField multiline maxRows={4} size="small" name={`details.${index}.description`} label="Descripción" />
                      </TableCell>
                      <TableCell sx={{ border: 'none' }}>
                        <FormikSelectField
                          id={`${index}`}
                          size="small"
                          name={`details.${index}.categoryId`}
                          label="Servicio"
                          options={categoryServices}
                        />
                      </TableCell>
                      <TableCell sx={{ border: 'none' }}>
                        <FormikTextField size="small" name={`details.${index}.quantity`} label="Cantidad" type="number" />
                      </TableCell>
                      <TableCell sx={{ border: 'none' }}>
                        <FormikTextField size="small" name={`details.${index}.price`} label="Precio" isAmount type="number" />
                      </TableCell>
                      <TableCell sx={{ border: 'none' }}>
                        <TextField label='Total' size="small" value={total} slotProps={{
                            input: {startAdornment: <InputAdornment className='invrow__adornment-disabled' position="start">$</InputAdornment>}
                        }} disabled />
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell sx={{ border: 'none', paddingTop: '0', paddingBottom: '0' }} colSpan={6} align="right">
                        <Button color="error" startIcon={<DeleteIcon />} onClick={() => remove(index)}>
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                  )
})}
<Divider 
          orientation="horizontal"
                    sx={{
                      borderStyle: 'dashed',
                      borderColor: '#ebeaea',
                      borderWidth: '1.9px',
                      borderTopWidth: "0",
                      margin: "16px 25px 0px 25px"
                    }}
                  />
                <TableRow>
                  <TableCell sx={{ border: 'none', paddingLeft: '15px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <Button
                        className="invrow__new-row--btn"
                        startIcon={<AddIcon />}
                        onClick={() =>
                          push({ title: '', description: '', categoryId: '', quantity: 1, price: 0 })
                        }
                      >
                        Nuevo elemento
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              </>
            )}
          </FieldArray>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InvoiceRowForm;
