import { Routes, Route } from "react-router-dom";
import './App.css'
import InvoiceList from './pages/invoiceList';

function App() {
  return (
    <>
    <div>
      <Routes>
        <Route path="/" element={<InvoiceList />} />
        </Routes>
    </div>
    </>
  )
}

export default App
