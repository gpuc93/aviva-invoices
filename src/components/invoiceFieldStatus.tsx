import * as React from 'react';
import MenuItem from '@mui/material/MenuItem';
import '../assets/css/invoiceMenu.css'
import { FormControl, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import { InvoiceStatus } from '../models/shared-models';
import { invoiceApi } from '../api/invoiceServices';

interface Props {
  handleSelect: React.Dispatch<React.SetStateAction<string>>
  value: string
  id: string
  classNameInput?: string
  classNameBtn?: string
  disabled?: boolean
}

export default function InvoiceFieldStatus({handleSelect, value, id, classNameInput, classNameBtn, disabled}: Props) {
  const [statusList, setStatusList] = React.useState<InvoiceStatus[]>([])

  React.useEffect(()=>{
    getStatus();
  },[])

  const getStatus = async () => {
    const data:InvoiceStatus[] = await invoiceApi.statusList();
    setStatusList(data)
  };

  const handleChangeStatusFilter = (event: SelectChangeEvent) => {
    handleSelect(event.target.value);
  };

  return (
    <FormControl disabled={disabled ?? false} fullWidth className={`invfield__btn ${classNameBtn && classNameBtn}`}>
        <InputLabel id={id} className={classNameInput && classNameInput}>Estatus</InputLabel>
        <Select
            labelId={id}
            id={`${id}-filter-status`}
            value={value}
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
  );
}
