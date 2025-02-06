import axios from "axios";
import dayjs, { Dayjs } from "dayjs";

const API_URL = import.meta.env.VITE_API_URL
const apikey = import.meta.env.VITE_API_KEY; 

interface InvoiceSearchParams {
  search: string;
  top?: number; 
  skip?: number;
  status?: string
  select?:string
  creationTime?: Dayjs | null
  dueDateTime?: Dayjs | null
}

export const invoiceApi = {
  async searchInvoices(params: InvoiceSearchParams) {
    const { search, top, skip, status, creationTime, dueDateTime } = params;
    const query = new URLSearchParams({
        $top: top?.toString() || '10',
        $skip: skip?.toString() || '0',
    });
    let filterQuery = '';

if (creationTime) {
    const formattedCreationTime = dayjs.utc(creationTime).local().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"); 
    const nextDay = dayjs.utc(creationTime).local().add(1, 'day').format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

    if (filterQuery) filterQuery += ' and ';
    filterQuery += `(creationTime ge ${formattedCreationTime} and creationTime le ${nextDay})`;
}

if (dueDateTime) {
    const formattedDueDateTime = dayjs.utc(dueDateTime).local().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    const nextDueDay = dayjs.utc(dueDateTime).local().add(1, 'day').format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

    if (filterQuery) filterQuery += ' and ';
    filterQuery += `(dueDateTime ge ${formattedDueDateTime} and dueDateTime le ${nextDueDay})`;
}


    if (status) {
        if (filterQuery) filterQuery += ' and ';
        filterQuery += `status eq '${status}'`;
    }

    if (search) {
        if (filterQuery) filterQuery += ' and ';
        filterQuery += `(contains(tolower(customerToFullName), '${search.toLowerCase()}') or contains(tolower(no), '${search.toLowerCase()}'))`;

    }
    
    if (filterQuery) {
        query.append("$filter", filterQuery);
    }

    // Si se ha especificado un select, se añade al query string
    /*if (select) {
        query.append("$select", select);
    }*/

    const queryString = query.toString();

    try {
        const responses = await axios.get(`${API_URL}/Invoice/Search?${queryString}`, {
          headers: {
            'Content-Type': 'application/json',
            'apikey': apikey,
          },
        });
      
        if (responses.status === 200) {
            return responses.data;
        } else {
            console.error(responses.status);
            return [];
        }
      } catch (error) {
        console.error(error);
        return [];
      }
  },

  async statusList() {
    try {
        const responses = await axios.get(`${API_URL}/Invoice/Status`, {
          headers: {
            'Content-Type': 'application/json',
            'apikey': apikey,
          },
        });
      
        if (responses.status === 200) {
            return responses.data;
        } else {
            console.error(responses.status);
            return [];
        }
      } catch (error) {
        console.error(error);
        return [];
      }
  },
};
