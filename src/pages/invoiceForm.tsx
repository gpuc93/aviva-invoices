import * as React from 'react';
import * as yup from 'yup';
import { FormikProvider, useFormik } from 'formik';
import '../assets/css/invoiceForm.css';
import '../assets/css/invoiceFieldStatus.css';
import { Button, Box, Paper, Breadcrumbs, Stack, Typography, Divider } from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { INVOCE_LIST, UPDATE_INVOICE } from '../utils/pathRoutes';
import InvoiceCustomerSelector from '../components/invoiceCustomerSelector';
import { CategoryService, Customer, Invoice, InvoiceCreate, InvoiceDetail } from '../models/shared-models';
import { invoiceApi } from '../api/invoiceServices';
import InvoiceRowForm from '../components/invoiceRowForm';
import InvoiceFieldStatus from '../components/invoiceFieldStatus';
import { FormikTextField } from '../components/FormikTextField';

interface InvoiceFormProps {
  editMode?: boolean;
}

interface FormValues {
  no: string;
  status: string;
  creationTime: Dayjs | null;
  dueDateTime: Dayjs | null;
  details: InvoiceDetail[];
}

const validationSchema = yup.object().shape({
  customerFromId: yup.string().required('Debe seleccionar un remitente'),
  customerToId: yup.string().required('Debe seleccionar un destinatario'),
  shipping: yup.number(),
  discount: yup.number(),
  taxes: yup.number(),
  
  no: yup.string().matches(/^INV-\d{4}$/, 'El formato debe ser INV-XXXX'),
  creationTime: yup.date().typeError('Fecha inválida').required('La fecha es requerida'),
  dueDateTime: yup.date().typeError('Fecha inválida').required('La fecha es requerida'),
  status: yup.string().required('El estado es obligatorio'),
  details: yup.array()
    .of(
      yup.object().shape({
        title: yup.string().trim().required('El título es obligatorio'),
        description: yup.string().trim(),
        categoryId: yup.string().trim().required('El servicio es obligatorio'),
        quantity: yup.number().typeError('Debe ser un número').min(1, 'Mínimo 1').required('Cantidad requerida'),
        price: yup
  .number()
  .typeError("Debe ser un número")
  .test("is-required", "Precio requerido", (value) => value !== 0)
  .min(0.01, "No puede ser negativo") // Evita valores negativos y 0
  .required("Precio requerido"),
        creationTime: yup.string().trim(),
        lastModificationTime: yup.string().trim(),
      })
    )
    .min(1, 'Debe haber al menos un elemento'),
});

const InvoiceForm: React.FC<InvoiceFormProps> = ({ editMode }) => {
  const location = useLocation();
  const invoiceId = location.state?.invoiceId;
  const navigate = useNavigate();
  

  const [invoiceData, setInvoiceData] = React.useState<Partial<Invoice>>();
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [categoryServices, setCategoryServices] = React.useState<CategoryService[]>([]);
  const [subtotal, setSubtotal] = React.useState(0);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    const getCustomers = async () => {
      const data: Customer[] = await invoiceApi.customerList();
      setCustomers(data);
    };
    const getCategoryServices = async () => {
      const data: CategoryService[] = await invoiceApi.categoryServiceList();
      setCategoryServices(data);
    };
    getCustomers();
    getCategoryServices()
  }, []);

  React.useEffect(() => {
    if (editMode && invoiceId) {
      const fetchData = async () => {
        const invoiceResponse = await invoiceApi.getInvoice(invoiceId);
        
        setInvoiceData(invoiceResponse);
      };
      fetchData();
    }
  }, [editMode, invoiceId]);

  const initialValues = React.useMemo(
    () => ({
      no: invoiceData?.no || '',
      creationTime: invoiceData ? dayjs(invoiceData.creationTime) : dayjs(),
      dueDateTime: invoiceData ? dayjs(invoiceData.dueDateTime) : null,
      status: invoiceData?.status || 'Draft',
      shipping: invoiceData?.shipping || 0,
      discount: invoiceData?.discount || 0,
      taxes: invoiceData?.taxes || 0,
      customerFromId: invoiceData?.customerFromId || '',
      customerToId: invoiceData?.customerToId || '',
      customerToFullName: invoiceData?.customerToFullName || '',
      details: invoiceData?.details
        ? invoiceData.details.map(detail => ({
            ...detail,
            creationTime: detail.creationTime || dayjs().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            lastModificationTime: dayjs().format('YYYY-MM-DDTHH:mm:ss.SSS'),
          }))
        : [
            {
              title: '',
              description: '',
              categoryId: '',
              quantity: 1,
              price: 0,
              creationTime: dayjs().format('YYYY-MM-DDTHH:mm:ss.SSS'),
              lastModificationTime: dayjs().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            },
          ],
    }),
    [invoiceData]
  );

  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const { no, creationTime, ...dataToSend } = values;

      const formattedInvoice: Partial<InvoiceCreate> = {
        ...dataToSend,
        dueDateTime: dayjs(values.dueDateTime).format('YYYY-MM-DDTHH:mm:ss.SSS'),
        details: values.details.map(detail => ({
          ...detail,
          price: detail.price,
          quantity: detail.quantity,
          creationTime: dayjs().format('YYYY-MM-DDTHH:mm:ss.SSS'),
          lastModificationTime: dayjs().format('YYYY-MM-DDTHH:mm:ss.SSS'),
        })),
      };

      if (editMode) {
        await invoiceApi.updateInvoice(invoiceId, formattedInvoice);
      } else {
        const invoiceIdRespnse = await invoiceApi.createInvoice(formattedInvoice);
     
        navigate(UPDATE_INVOICE, { state: { invoiceId: invoiceIdRespnse } });
      }

      console.log('Datos enviados:', JSON.stringify(formattedInvoice, null, 2));
    },
  });


  const handleTotalsChange = (newSubtotal: number, newTotal: number) => {
    setSubtotal(newSubtotal);
    setTotal(newTotal);
  };

  const breadcrumbs = [
    <Link key="1" color="red" to={INVOCE_LIST}>
      <Typography key="3" sx={{ fontSize: '14px', color: 'black' }}>
        Facturas
      </Typography>
    </Link>,
    <Typography key="3" sx={{ fontSize: '14px', color: '#9eaac6' }}>
      {(invoiceData && editMode) ? invoiceData.no : "Nueva factura"}
    </Typography>,
  ];

  return (
    <FormikProvider value={formik}>
      <Box component="form"
          onSubmit={formik.handleSubmit}>
      <div className="banner--title invform__banner">
        <div className="invform__banner--titles">
          <h1>{editMode ? "Editar" : "Crear nueva factura"}</h1>
          <Stack spacing={2}>
            <Breadcrumbs separator="•" aria-label="breadcrumb">
              {breadcrumbs}
            </Breadcrumbs>
          </Stack>
        </div>
      </div>

      <Paper className='invform--container' sx={{ width: '100%', overflow: 'hidden', borderRadius: "16px" }}>
        <div className="invform__customer-selec--content">
        {customers.length > 0 && (
    <>
      <InvoiceCustomerSelector
        isFormik={true}
        name="customerFromId"
        label="De"
        customers={customers}
      />
      <Divider className="invform__customer--divider" orientation="vertical" variant="middle" flexItem />
      <InvoiceCustomerSelector
        isFormik={true}
        name="customerToId"
        label="Para"
        customers={customers}
      />
    </>
  )}
        </div>

        <Box
          className="invform__form"
          
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, mx: 'auto', p: 2 }}
        >
          <div className="invform__row--data-invoice" style={{ backgroundColor: !editMode ? '#f4f6f8' : '#ffffff', padding: 16 }}>
            <FormikTextField disabled name="no" label="Número de factura" />
            
            <InvoiceFieldStatus
            disabled={editMode}
              id="filter-status-invoice"
              handleSelect={(status) => formik.setFieldValue('status', status)}
              value={formik.values.status}
              
            />

            <DesktopDatePicker
              disabled
              className="invform__field--date"
              format="DD/MM/YYYY"
              label="Fecha creación"
              value={formik.values.creationTime}
              onChange={(newValue: Dayjs | null) => {
                formik.setFieldValue('creationTime', newValue);
              }}
              slotProps={{
                textField: {
                  error: formik.touched.creationTime && Boolean(formik.errors.creationTime),
                  helperText: formik.touched.creationTime && formik.errors.creationTime,
                },
              }}
            />

            <DesktopDatePicker
            disabled={editMode}
              className="invform__field--date"
              format="DD/MM/YYYY"
              label="Fecha vencimiento"
              value={formik.values.dueDateTime}
              onChange={(newValue: Dayjs | null) => {
                formik.setFieldValue('dueDateTime', newValue);
              }}
              slotProps={{
                textField: {
                  error: formik.touched.dueDateTime && Boolean(formik.errors.dueDateTime),
                  helperText: formik.touched.dueDateTime && formik.errors.dueDateTime,
                },
              }}
            />
          </div>

          <InvoiceRowForm formik={formik} onTotalsChange={handleTotalsChange} categoryServices={categoryServices} />
          
          <div className="invform__total--content">
            <div className="invform__total--row">
              <label className="invform__subtotal--lbl">Subtotal</label>
              <label className="invform__subtotal--amount"> ${subtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</label>
            </div>
            <div className="invform__total--row">
            <label className="invform__total--lbl">Total</label>
            <label className="invform__total--amount"> ${total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</label>
            </div>
          </div>

          

         
        </Box>
      </Paper>

       <div className='invform__footer'>
          <Link key="1" color="inherit" to={INVOCE_LIST}>
              <Button className='cancel--btn' variant="contained" size='large' type="submit" sx={{ mt: 3, fontWeight: "bold" }}>
                {'Cancelar'}
              </Button>
            </Link>
       
          <Button color="primary" variant="contained" size='large' type="submit" sx={{ mt: 3, fontWeight: "bold" }}>
              {editMode ? 'Actualizar' : 'Guardar'}
          </Button>
       </div>
        </Box>
    </FormikProvider>
  );
};

export default InvoiceForm;
