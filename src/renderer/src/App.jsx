import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home/Home'
import Customers from './pages/Customers/Customers'
import Finances from './pages/Finances/Finances'
import AddCustomer from './pages/AddCustomer/AddCustomer'
import AddTransaction from './pages/AddTransaction/AddTransaction'
import Total from './pages/Total/Total'
import Details from './pages/View/Details'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Navigate to="/" />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/finances" element={<Finances />} />
        <Route path="/addCustomer" element={<AddCustomer />} />
        <Route path="/addTransaction" element={<AddTransaction />} />
        <Route path="/total" element={<Total />} />
        <Route path="/details" element={<Details />} />
      </Routes>
    </Router>
  )
}

export default App
