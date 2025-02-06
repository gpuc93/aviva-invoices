
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { invoiceApi } from '../api/invoiceServices';
import { Invoice, InvoiceResponseDto, InvoiceStatus, InvoiceStatusType } from '../models/shared-models';
import { Box, Button, FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent, TableSortLabel } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import AddIcon from '@mui/icons-material/Add';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from "dayjs/plugin/timezone";
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import InvoiceMenu from '../components/invoiceMenu';
import '../assets/css/invoiceList.css'

dayjs.extend(utc);
dayjs.extend(timezone);

interface Column {
  id: 'customerToFullName' | 'creationTime' | 'dueDateTime' | 'amount' | 'status' | 'options';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
  isSorteable?: boolean
}

const columns: readonly Column[] = [
  { id: 'customerToFullName', label: 'Cliente', minWidth: 270, isSorteable: true },
  { id: 'creationTime', label: 'Creación', minWidth: 150, isSorteable: true },
  {
    id: 'dueDateTime',
    label: 'Vencimiento',
    minWidth: 170,
    isSorteable: true
  },
  {
    id: 'amount',
    label: 'Monto',
    minWidth: 170,
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 170,
  },
  {
    id: 'options',
    label: '',
    minWidth: 70,
    align: "right"
  },
];

export default function InvoiceList() {
  const defaultRowsPerPage = 5;
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(defaultRowsPerPage);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [invoicesTotalCount, setInvoicesTotalCount] = React.useState<InvoiceResponseDto["totalRows"]>(0);
  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Invoice>('name' as keyof Invoice);
  const [hasMore, setHasMore] = React.useState(true);
  const [statusList, setStatusList] = React.useState<InvoiceStatus[]>([])
  const [statusFilter, setStatusFilter] = React.useState('');
  const [searchFilter, setSearchFilter] = React.useState('');
  const [startDateFilter, setStartDateFilter] = React.useState<Dayjs | null>();
  const [endDateFilter, setEndDateFilter] = React.useState<Dayjs | null>();
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [clearFilterAvailable, setClearFilterAvailable] = React.useState<boolean>(false);


  React.useEffect(() => {
    getInvoices();
  }, [page, rowsPerPage, refreshKey]);

  React.useEffect(()=>{
    getStatus();
  },[])

  const getInvoices = async () => {
    const data: InvoiceResponseDto = await invoiceApi.searchInvoices({ 
        search: searchFilter, 
        top: rowsPerPage, 
        skip: (page * rowsPerPage),
        status: statusFilter,
        select: "no,customerToFullName,creationTime",
        creationTime: startDateFilter ? startDateFilter: undefined,
        dueDateTime: endDateFilter ? endDateFilter : undefined
      });
    
      setInvoices(data.result);
      setInvoicesTotalCount(data.totalRows);
      setHasMore(data.result.length === rowsPerPage)
  };

  const getStatus = async () => {
    const data:InvoiceStatus[] = await invoiceApi.statusList();
    setStatusList(data)
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value));
    setPage(0);
  };

  const handleRequestSort = (property: keyof Invoice) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };  

  const stableSort = (array: Invoice[], comparator: (a: Invoice, b: Invoice) => number) => {
    const stabilizedThis = array.map((el, index) => [el, index] as [Invoice, number]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const descendingComparator = (a: Invoice, b: Invoice, orderBy: keyof Invoice) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };
  

  const comparator = (a: Invoice, b: Invoice) => {
    return order === 'desc' ? descendingComparator(a, b, orderBy) : -descendingComparator(a, b, orderBy);
  };

  const sortedInvoices = stableSort(invoices, comparator);

  const getBackgroundColor = (name: string) => {
    const colors = {
      A: '#ff6347',
      B: '#32cd32',
      C: '#1e90ff',
    };
  
    const firstLetter = name?.charAt(0).toUpperCase();
  
    if (firstLetter in colors) {
      return colors[firstLetter as keyof typeof colors];
    }
  
    return '#dcdcdc';
  }


    const createSortHandler = (_event: React.MouseEvent<unknown>, property: keyof Invoice) => {
      handleRequestSort(property);
    };

    const formatDateAndTime = (dateString: string): { date: string; time: string } => {
        const localDate = dayjs.utc(dateString).local();

        const formattedDate = localDate.format("D MMM YYYY"); 
        const formattedTime = localDate.format("h:mm a");

        return {
            date: formattedDate,
            time: formattedTime,
        };
    };


      const handleChangeStatusFilter = (event: SelectChangeEvent) => {
        setStatusFilter(event.target.value);
      };

      const handleSearch = () => {
        setPage(0);
        setRowsPerPage(defaultRowsPerPage);
        setRefreshKey(prev => prev + 1);
        setClearFilterAvailable(true)
      }

      const handleClearSearch = () => {
        setStatusFilter('');
        setSearchFilter('')
        setStartDateFilter(null)
        setEndDateFilter(null)
        setRowsPerPage(defaultRowsPerPage);
        setRefreshKey(prev => prev + 1);
        setClearFilterAvailable(false)
      }

  return (
    <>
    <div className='banner--title'>
        <h1>Lista de facturas</h1>
        <Button variant="contained" startIcon={<AddIcon />}>
        Nueva Factura
      </Button>
      </div>  
    
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
    <div className='invli__filter--content'>
    <FormControl className='invli__filter--btn' sx={{ m: 1}}>
        <InputLabel id="filter-status-label" className='invli__filter--label'>Estatus</InputLabel>
        <Select
            labelId="filter-status-label"
            id="filter-status"
            value={statusFilter}
            label="Estatus"
            onChange={handleChangeStatusFilter}
        >
          {statusList.length > 0 && statusList.map((statusItem)=> (
            <MenuItem className='invli__menu--item' key={statusItem.value} value={statusItem.value}>
                <span>{statusItem.text}</span>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
    <FormControl className='invli__filter--btn'>
        <DesktopDatePicker className='invli__filter--date' format='DD-MM-YYYY' label="Fecha inicio" value={startDateFilter} onChange={(newValue) => setStartDateFilter(newValue)} />
      </FormControl>

      <FormControl className='invli__filter--btn'>
        <DesktopDatePicker className='invli__filter--date' format='DD-MM-YYYY' label="Fecha fin" value={endDateFilter} onChange={(newValue) => setEndDateFilter(newValue)} />
      </FormControl>

      <FormControl className='invli__search--content' variant="outlined">
          <OutlinedInput
            id="outlined-adornment-weight"
            startAdornment={<InputAdornment position="end"><SearchIcon/></InputAdornment>}
            aria-describedby="outlined-weight-helper-text"
            inputProps={{
              'aria-label': 'weight',
            }}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder='Buscar por cliente o número de factura...'
          />
        </FormControl>

        {clearFilterAvailable && (
            <FormControl variant="outlined">
                <Button className='invli__clear--btn' variant="outlined" size="large" title='Limpiar busqueda' onClick={handleClearSearch}>
                    <ClearIcon/>
                </Button>
            </FormControl>
        )}
        
      <FormControl variant="outlined">
        <Button className='invli__search--btn' variant="contained" size="large" onClick={handleSearch}>
          Buscar
        </Button>
        
        </FormControl>
      
      
    </div>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow key={9}>
              {columns.map((column) => (
                <TableCell
                key={`${column.id}-624`}
                align={column.align ? 'right' : 'left'}
                padding={'normal'}
                sortDirection={orderBy === column.id ? order : false}
                style={{ minWidth: column.minWidth }}
              >
                {
                    column.isSorteable ? (
                        <TableSortLabel
                            active={orderBy === column.id}
                            direction={orderBy === column.id ? order : 'asc'}
                            onClick={(e) => createSortHandler(e, column.id as keyof Invoice)}
                            >
                            {column.label}
                            {orderBy === column.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                            </TableSortLabel>
                    ) : (<>{column.label}</>)
                }
              </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedInvoices
              .map((row: Invoice, index) => {
                const { date: dateStart, time: timeStart } = formatDateAndTime(row.creationTime);
                const { date:dateEnd, time:timeEnd } = formatDateAndTime(row.dueDateTime);
                return (
                <TableRow hover role="checkbox" tabIndex={-1} key={`${row.id || 'row'}-${index}`}>
                  <TableCell className='invli__profile--cell'>
                    <span className='invli__profile--icon' style={{ backgroundColor: getBackgroundColor(row.customerToFullName) }}>
                      {row.customerToFullName ? row.customerToFullName.charAt(0).toUpperCase() : ''}
                    </span>
                    <div className='invli__profile--details'>
                      <label className='invli__profile--name' htmlFor={row.customerToFullName}>{row.customerToFullName}</label>
                      <label className='invli__profile--no' htmlFor={row.no}>{row.no}</label>
                    </div>
                  </TableCell>
                  <TableCell>
                    {/*<TableCell>{JSON.stringify(row)}</TableCell>*/}
                    <div className='invli__profile--details'>
                        <label className='invli__profile--date' htmlFor={dateStart}>{dateStart}</label>
                        <label className='invli__profile--time' htmlFor={timeStart}>{timeStart}</label>
                    </div>
                   </TableCell>
                   <TableCell>
                    <div className='invli__profile--details'>
                        <label className='invli__profile--date' htmlFor={dateEnd}>{dateEnd}</label>
                        <label className='invli__profile--time' htmlFor={timeEnd}>{timeEnd}</label>
                    </div>
                   </TableCell>
                   <TableCell>
                    <div className='invli__profile--details'>
                    <label className='invli__profile--date' htmlFor={`${row.amount}`}>${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</label>
                    </div>
                   </TableCell>
                   <TableCell>
                    <div className='invli__profile--details center-items'>
                    <StatusInvoiceComponent status={row.status}></StatusInvoiceComponent>
                    </div>
                   </TableCell>
                   <TableCell>
                    <div className='invli__profile--details flex-end'>
                    <InvoiceMenu></InvoiceMenu>
                    </div>
                   </TableCell>
                </TableRow>
                )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 15]}
        component="div"
        count={invoicesTotalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página"
        slotProps={{
            actions: {
              nextButton: { disabled: !hasMore },
            },
          }}
      />
    </Paper>
    </>
  );
}
interface StatusInvoiceProps {
    status: InvoiceStatusType;
  }

export function StatusInvoiceComponent ({ status }: StatusInvoiceProps) {

    const generateStatusStyle = (status:InvoiceStatusType) => {
        switch (status) {
            case "Paid":
              return {
                color: "#1b9535",
                backgroundColor: "#dbf6e5",
              };
            case "Pending":
              return {
                color: "#d78a1a",
                backgroundColor: "#fff1d6",
              };
            case "Overdue":
              return {
                color: "red",
                backgroundColor: "#f8d7da",
              };
            case "Draft":
              return {
                color: "gray",
                backgroundColor: "#e2e3e5",
              };
            case "Unknown":
            default:
              return {
                color: "black",
                backgroundColor: "#f0f0f0",
              };
          }
      }

      const generateStatusLabel = (status:InvoiceStatusType) => {
        switch (status) {
            case "Paid":
              return "Pagado"
            case "Pending":
              return "Pendiente"
            case "Overdue":
              return "Vencido"
            case "Draft":
             return "Pendiente"
            case "Unknown":
            default:
              return "Desconocido";
          }
      }

    return (
        <div className='invli--status' style={generateStatusStyle(status)}><label htmlFor="">{generateStatusLabel(status)}</label></div>
    )
}