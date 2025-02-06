import { Routes, Route } from "react-router-dom";
import './App.css'
import InvoiceList from './pages/invoiceList';
import InvoiceForm from "./pages/invoiceForm";

function App() {
  return (
    <>
    <div>

      <Routes>
        <Route path="/" element={<InvoiceList />} />
          <Route path="/create" element={<InvoiceForm />} />
          {/*
          <Route path="/edit/:id" element={<InvoiceForm editMode />} />*/}
        </Routes>
    </div>
      
    </>
  )
}

export default App
