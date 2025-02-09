interface InvoiceDetails {
    title: string;
    description: string;
    categoryId: string;
    quantity: number;
    price: number;
    creationTime: string;
    lastModificationTime?: string;
  }
  
  export interface Invoice {
    amount: number;
    creationTime: string;
    customerFromId: string;
    customerToFullName: string;
    customerToId: string;
    details: InvoiceDetails[];
    discount: number;
    dueDateTime: string;
    id: string;
    no: string;
    shipping: number;
    status: InvoiceStatusType;
    taxes: number;
  }

  export interface InvoiceResponseDto {
    result: Invoice[] | []
    page: number
    rowsPerPage: number
    totalRows: number
    }

    export interface InvoiceStatus {
        text: string;
        value: InvoiceStatusType;
      }

    export type InvoiceStatusType = "Unknown" | "Paid" | "Pending" | "Overdue" | "Draft";

    export interface Customer {
        id: string;
        name: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
      }

      export interface CategoryService {
        id: string;
        name: string;
      }

      export interface InvoiceDetail {
        title: string;
        description: string;
        categoryId: string;
        quantity: number;
        price: number;
        creationTime: string;
        lastModificationTime: string;
      }
      
      export interface InvoiceCreate {
        customerFromId: string;
        customerToId: string;
        customerToFullName: string;
        shipping: number;
        discount: number;
        taxes: number;
        status: string;
        details: InvoiceDetail[];
        dueDateTime: string;
      }
      