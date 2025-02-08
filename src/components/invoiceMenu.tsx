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
import { invoiceApi } from '../api/invoiceServices';

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

        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
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
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Link to={UPDATE_INVOICE} state={{ invoiceId }}>
        <MenuItem onClick={handleClose}>
        

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
            borderTopWidth: "0"
          }}
        />
        <MenuItem onClick={handleOpenDialogDelete}>
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
      className='dfabadsfasudiucasfuhadshfuahdsfuiasihfdiuh'
      sx={{borderRadius: "10px"}}
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
          {"Eliminar"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Estas seguro de eliminar la factura?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus variant="contained" onClick={handleDelete}>
            Eliminar
          </Button>
          <Button  variant="contained" color='error' onClick={handleClose} autoFocus>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
