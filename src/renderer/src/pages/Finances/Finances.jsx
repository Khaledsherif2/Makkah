import { useEffect, useState } from 'react'
import './Finances.css'
import Loader from '../../components/Loader/Loader'
import { useNavigate } from 'react-router-dom'
import { Toast } from '../../utils/Toast'
import { getAllTransactions, getAllPayments } from '../../../../services/ipcRenderer'
const Finances = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [payments, setPayments] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoading(true)
    Promise.all([getAllTransactions(), getAllPayments()])
      .then(([transactionsRes, paymentsRes]) => {
        if (transactionsRes.status === 'success') {
          setTransactions(transactionsRes.transactions)
        } else {
          console.error('Error fetching Transactions:', transactionsRes.message)
        }

        if (paymentsRes.status === 'success') {
          setPayments(paymentsRes.payments)
        } else {
          console.error('Error fetching Payments:', paymentsRes.message)
        }
        setIsLoading(false)
      })
      .catch((error) => {
        Toast.fire({
          icon: 'error',
          title: 'Error fetching data' + error.message
        })
        setIsLoading(false)
      })

    return () => {
      window.electron.ipcRenderer.removeAllListeners('fromMain:getAllTransactions')
      window.electron.ipcRenderer.removeAllListeners('fromMain:getAllPayments')
    }
  }, [])

  return (
    <div className="finances">
      <div className="container-fluid">
        <button className="btn" onClick={() => navigate('/addTransaction')}>
          اضافه معاملة
        </button>
        {isLoading ? (
          <Loader />
        ) : (
          <div className="d-flex gap-5">
            <table className="table table-striped table-bordered border-primary">
              <thead>
                <tr>
                  <th>تاريخ</th>
                  <th>رقم العميل</th>
                  <th>الحساب</th>
                  <th>سجاد</th>
                  <th>بطاطين</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.date}</td>
                      <td>{transaction.code}</td>
                      <td>{transaction.price}</td>
                      <td>{transaction.carpetPrice}</td>
                      <td>{transaction.blanketPrice}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">لا توجد معاملات</td>
                  </tr>
                )}
              </tbody>
            </table>
            <table className="table table-striped table-bordered border-primary">
              <thead>
                <tr>
                  <th colSpan={2}>مصروفات</th>
                </tr>
                <tr>
                  <th>نقدي</th>
                  <th>أصناف</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.cash}</td>
                      <td>{payment.types}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">لا توجد مصروفات</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Finances
