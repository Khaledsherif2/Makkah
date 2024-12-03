import './Navbar.css'
import { NavLink } from 'react-router-dom'
import logo from '../../assets/images/logo.png'

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <NavLink to="/" className="logo">
          <img src={logo} alt="logo" />
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav">
            <NavLink to="/" className="nav-link">
              الرئيسيه
            </NavLink>
            <NavLink to="/customers" className="nav-link">
              العملاء
            </NavLink>
            <NavLink to="/finances" className="nav-link">
              الماليه
            </NavLink>
            <NavLink to="/total" className="nav-link">
              صافي المعاملات
            </NavLink>
            <NavLink to="/addCustomer" className="nav-link">
              اضافة عميل
            </NavLink>
            <NavLink to="/addTransaction" className="nav-link">
              اضافة معاملات
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
