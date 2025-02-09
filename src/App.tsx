import { Routes, Route } from "react-router-dom";
import './App.css'
import InvoiceList from './pages/InvoiceList';
import InvoiceForm from "./pages/InvoiceForm";
import { UPDATE_INVOICE } from "./utils/pathRoutes";

import { useDispatch } from "react-redux";
import { AppDispatch } from "./store";
import { fetchCustomers } from "./store/customerSlice";
import { useEffect } from "react";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  return (
    <>
      <Routes>
        <Route path="/" element={<InvoiceList />} />
          <Route path="/create" element={<InvoiceForm />} />
          <Route path={`${UPDATE_INVOICE}`} element={<InvoiceForm editMode />} />
      </Routes>
    </>
  )
}

export default App
