
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
import { Invoice, InvoiceResponseDto, InvoiceStatusType } from '../models/shared-models';
import { Box, Button, debounce, FormControl, InputAdornment, OutlinedInput, TableSortLabel } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import AddIcon from '@mui/icons-material/Add';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from "dayjs/plugin/timezone";
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import InvoiceMenu from '../components/InvoiceMenu';
import '../assets/css/invoiceList.css'
import InvoiceFieldStatus from '../components/InvoiceFieldStatus';
import { CREATE_INVOICE } from '../utils/pathRoutes';
import { Link } from 'react-router-dom';

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
const InvoiceList: React.FC = () => {
  const defaultRowsPerPage = 5;
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(defaultRowsPerPage);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [invoicesTotalCount, setInvoicesTotalCount] = React.useState<InvoiceResponseDto["totalRows"]>(0);
  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Invoice>('name' as keyof Invoice);
  const [hasMore, setHasMore] = React.useState(true);
  
  const [statusFilter, setStatusFilter] = React.useState('');
  const [searchFilter, setSearchFilter] = React.useState('');
  const [startDateFilter, setStartDateFilter] = React.useState<Dayjs | null>(null);
  const [endDateFilter, setEndDateFilter] = React.useState<Dayjs | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [clearFilterAvailable, setClearFilterAvailable] = React.useState<boolean>(false);



  React.useEffect(() => {
    getInvoices();
  }, [page, rowsPerPage, refreshKey]);

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


      

      const handleSearch = (forced:boolean) => {
        
        if(!forced) {
            /**Validation to force the search when deleted an item */
            setPage(0);
            if(statusFilter != '' || searchFilter != '' || startDateFilter != null || endDateFilter != null) {
              setClearFilterAvailable(true)
            }
        }
        setRowsPerPage(defaultRowsPerPage);
        setRefreshKey(prev => prev + 1);
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
        <Link to={CREATE_INVOICE}><Button variant="contained" startIcon={<AddIcon />}>
        Nueva Factura
      </Button></Link>
      </div>  
    
    <Paper className='invli--container' sx={{ width: '100%', overflow: 'hidden' }}>
    <div className='invli__filter--content'>
        
    <InvoiceFieldStatus id='filter-status-label' classNameInput='invli__filter--label' classNameBtn="invli__filter--btn" handleSelect={setStatusFilter} value={statusFilter} />
      
    <FormControl className='invli__filter--btn'>
        <DesktopDatePicker className='invli__filter--date' format='DD-MM-YYYY' label="Fecha inicio" value={startDateFilter} onChange={(newValue) => setStartDateFilter(newValue)} />
      </FormControl>

      <FormControl className='invli__filter--btn'>
        <DesktopDatePicker className='invli__filter--date' format='DD-MM-YYYY' label="Fecha fin" value={endDateFilter} onChange={(newValue) => setEndDateFilter(newValue)} />
      </FormControl>

        <SearchInput
        className="invli__search--content"
        value={searchFilter}
        onSearch={(value) => setSearchFilter(value)}
        />

        {clearFilterAvailable && (
            <FormControl variant="outlined">
                <Button className='invli__clear--btn' variant="outlined" size="large" title='Limpiar busqueda' onClick={handleClearSearch}>
                    <ClearIcon/>
                </Button>
            </FormControl>
        )}
        
      <FormControl variant="outlined">
        <Button className='invli__search--btn' variant="contained" size="large" onClick={() => handleSearch(false)}>
          Buscar
        </Button>
        
        </FormControl>
      
      
    </div>
      <TableContainer className='invli__table--container' sx={{ maxHeight: 440 }}>
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
                    <InvoiceMenu handleSearch={handleSearch} invoiceId={row.id}></InvoiceMenu>
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
                color: "#23cd7d",
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

export default InvoiceList;

interface SearchInputProps {
    onSearch: (value: string) => void;
    placeholder?: string;
    delay?: number;
    className?: string;
    value: string
  }
  
  export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, placeholder = "Buscar por cliente o número de factura...", delay = 500, className, value }) => {
    const [searchText, setSearchText] = React.useState("");

    React.useEffect(() => {
        setSearchText(value)
    }, [value])
  
    const debouncedSearch = React.useMemo(() => debounce(onSearch, delay), [onSearch, delay]);
  
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchText(value);
      debouncedSearch(value);
    };
  
    return (
      <FormControl className={className} variant="outlined">
        <OutlinedInput
          id="search-input"
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          }
          aria-describedby="search-helper-text"
          inputProps={{ "aria-label": "search" }}
          value={searchText}
          onChange={handleChange}
          placeholder={placeholder}
        />
      </FormControl>
    );
  };
  