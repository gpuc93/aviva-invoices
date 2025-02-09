import * as React from 'react';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import '../assets/css/invoiceMenu.css'
import { Link } from 'react-router-dom';
import { UPDATE_INVOICE } from '../utils/pathRoutes';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { invoiceApi } from '../api/InvoiceServices';

interface InvoiceMenuProps {
  invoiceId: string
  handleSearch: (forced: boolean) => void
}

export default function InvoiceMenu({invoiceId, handleSearch}: InvoiceMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [openDialog, setOpenDialog] = React.useState(false);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialogDelete = () => {
    handleClose()
    setOpenDialog(true)
  }

  const handleDelete = async () => {
    await invoiceApi.deleteInvoice(invoiceId)
    handleSearch(true);
    setOpenDialog(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Tooltip title="Opciones">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <MoreVertIcon/>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
      className='invmenu__menu--content'
anchorOrigin={{
  vertical: 'top',
  horizontal: 'left',
}}
transformOrigin={{
  vertical: 'center',
  horizontal: 'right',
}}
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              top: 50,
              borderRadius: 2,
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 5px rgba(0,0,0,0.15))',
              mt: 3.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 27,
                right: -5,
                width: 20,
                height: 20,
                bgcolor: '#f9fdfd',
                transform: 'translateY(-50%) rotate(135deg)',
                zIndex: 0,
              },
            },
          },
        }}

      >
        
        
          <Link to={UPDATE_INVOICE} state={{ invoiceId }}>
          <MenuItem className='invmenu__item invmenu__item--edit' color='black'>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Editar
          </MenuItem>
         </Link>
        
        
        <Divider 
          sx={{
            borderStyle: 'dashed',
            borderColor: '#ebeaea',
            borderWidth: '1.9px',
            borderTopWidth: "0",
            margin: "0 !important"
          }}
        />
        <MenuItem className='invmenu__item invmenu__item--delete' onClick={handleOpenDialogDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Eliminar
        </MenuItem>
      </Menu>
      <DeleteDialog open={openDialog} handleClose={handleCloseDialog} handleDelete={handleDelete}></DeleteDialog>
    </React.Fragment>
  );
}

interface DeleteDialogProps {
  open: boolean
  handleClose: () => void
  handleDelete: () => void
}

export function DeleteDialog({open, handleClose, handleDelete}: DeleteDialogProps) {
  
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  

  return (
    <React.Fragment>
      <Dialog
      sx={{borderRadius: "10px"}}
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <div className='dialog--component'>
        <DialogTitle sx={{padding: 0, paddingBottom: "15px"}} id="responsive-dialog-title">
          {"Eliminar"}
        </DialogTitle>
        <DialogContent sx={{padding: 0,  paddingBottom: "15px"}}>
          <DialogContentText>
            Estas seguro de eliminar la factura?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{
          display: "flex",
          flexDirection: "row",
          columnGap: "6px"
        }}>
          <Button color='error' autoFocus variant="contained" onClick={handleDelete}>
            Eliminar
          </Button>
          <Button className='cancel--btn' variant="contained" onClick={handleClose} autoFocus>
            Cancelar
          </Button>
        </DialogActions>
        </div>
        
      </Dialog>
    </React.Fragment>
  );
}
