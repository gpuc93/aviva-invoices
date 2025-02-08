import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  TextField,
  IconButton,
  ListItemButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import '../assets/css/dialogCustomer.css'

interface Customer {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

interface CustomerDialogProps {
  open: boolean;
  onClose: () => void;
  customers: Customer[];
  handleSelect: (customer: Customer) => void;
  currentCustomer?: Customer
}


const CustomerDialog: React.FC<CustomerDialogProps> = ({ open, onClose, customers, handleSelect, currentCustomer }) => {
  const [search, setSearch] = React.useState('');
  

  const filteredCustomers = customers.filter(customer =>
    `${customer.name} ${customer.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectItem = (customer: Customer) => {
    handleSelect(customer)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="draggable-dialog-title">
      <DialogTitle sx={{ cursor: 'move', fontSize: "14px", fontWeight: "bold", padding: "15px", paddingBottom: "10px" }} id="draggable-dialog-title">
        Clientes
      </DialogTitle>
      <DialogContent sx={{padding: "15px"}}>
        <TextField
        className='dialog__search--input'
          fullWidth
          variant="outlined"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <IconButton disabled edge="start" size="small">
                <SearchIcon />
              </IconButton>
            )
          }}
        />
        <List className='dialog__list'>
          {filteredCustomers.map(customer => (
            <ListItem className="dialog__customer--item" key={customer.id} onClick={() => handleSelectItem(customer)}>
              <ListItemButton selected={customer.id == currentCustomer?.id} className='dialog__customer--btn'>
              <ListItemText className='dialog__label--primary' primary={`${customer.name} ${customer.lastName}`}/>
              <ListItemText className='dialog__label--secondary' secondary={`${customer.address}`}/>
              <ListItemText className='dialog__label--secondary' secondary={`${customer.phone}`}/>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button color="secondary" variant="contained" onClick={onClose}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerDialog;