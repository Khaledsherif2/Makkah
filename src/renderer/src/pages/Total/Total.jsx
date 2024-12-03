import './Total.css'
import { useState, useEffect, useCallback } from 'react'
import Loader from '../../components/Loader/Loader'
import {
  addTotalTransaction,
  filterTransactions,
  getTotalTransactions
} from '../../../../services/ipcRenderer'
import { Toast } from '../../utils/Toast'

const Total = () => {
  const [total, setTotal] = useState([])
  const [isLoading, setIsLoading] = useState()
  const [clicked, setClicked] = useState(false)

  const formatDate = useCallback((date, daily) => {
    const day = date.getDate()
    const month = daily ? date.getMonth() + 1 : date.getMonth() == 0 ? 12 : date.getMonth()
    const year = date.getFullYear()
    return `${year}/${month}/${day}`
  })

  const totalCalculations = useCallback((data) => {
    const totalTransactions = data.transactions.reduce(
      (acc, obj) => {
        acc.totalPrice += +obj.price || 0
        acc.totalCPrice += +obj.carpetPrice || 0
        acc.totalBPrice += +obj.blanketPrice || 0
        return acc
      },
      { totalPrice: 0, totalCPrice: 0, totalBPrice: 0 }
    )

    const totalPayments = data.payments.reduce((sum, item) => sum + parseFloat(item.cash || 0), 0)

    return { ...totalTransactions, totalPayments }
  })

  useEffect(() => {
    const date = formatDate(new Date()).split('/')
    const lastRun = JSON.parse(localStorage.getItem('lastFilterRun')) || {}
    const lastRunMonth = lastRun.month
    const lastRunYear = lastRun.year

    const inProgress = localStorage.getItem('filterRunInProgress')

    if (date[2] == 1 && (lastRunMonth !== date[1] || lastRunYear !== date[0]) && !inProgress) {
      localStorage.setItem('filterRunInProgress', 'true')
      setIsLoading(true)
      filterTransactions(`${date[0]}/${date[1]}`)
        .then(async (res) => {
          if (res.status === 'success') {
            const total = totalCalculations(res)
            const transaction = { ...total, date: `${date[0]}/${date[1]}` }
            localStorage.setItem('lastFilterRun', JSON.stringify({ month: date[1], year: date[0] }))
            return await addTotalTransaction(transaction)
          } else {
            setIsLoading(false)
            return Toast.fire({
              icon: 'error',
              title: 'حدث خطأ في جلب المعاملات'
            })
          }
        })
        .catch((e) => {
          Toast.fire({
            icon: 'error',
            title: 'Error processing total transaction' + e.message
          })
        })
        .finally(() => {
          localStorage.removeItem('filterRunInProgress')
          setIsLoading(false)
        })
    } else {
      setIsLoading(true)
      getTotalTransactions()
        .then((res) => {
          if (res.status === 'success') {
            setTotal(res.transactions)
          } else {
            Toast.fire({
              icon: 'error',
              title: 'حدث خطأ اثناء تحميل المعاملات' + res.message
            })
          }
          setIsLoading(false)
        })
        .catch((e) => {
          Toast.fire({
            icon: 'error',
            title: 'حدث خطأ أثناء تحميل البيانات' + e.message
          })
          setIsLoading(false)
        })
    }
  }, [clicked])

  const handleClick = () => {
    setIsLoading(true)
    filterTransactions(formatDate(new Date(), true))
      .then((res) => {
        if (res.status === 'success') {
          const total = totalCalculations(res)
          setTotal([
            { ...total, code: res.transactions.length, date: formatDate(new Date(), true) }
          ])
          setIsLoading(false)
        } else {
          throw new Error('Error fetching filtered transactions')
        }
      })
      .catch((error) => {
        Toast.fire({
          icon: 'error',
          title: 'Error processing total transaction' + error.message
        })
      })
  }

  return (
    <div className="finances">
      <div className="container-fluid">
        <div className="btns">
          <button className="btn" onClick={handleClick}>
            المعاملات اليوميه
          </button>
          <button className="btn" onClick={() => setClicked((prev) => !prev)}>
            المعاملات الشهريه
          </button>
        </div>
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
                {total.length > 0 ? (
                  total.map((t) => (
                    <tr key={t.id}>
                      <td>{t.date}</td>
                      <td>
                        {t.code ? `عدد العملاء (${t.code})` : `تجميع شهر ${t.date.split('/')[1]}`}
                      </td>
                      <td>{t.totalPrice}</td>
                      <td>{t.totalCPrice}</td>
                      <td>{t.totalBPrice}</td>
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
                {total.length > 0 ? (
                  total.map((t) => (
                    <tr key={t.id}>
                      <td>{t.totalPayments}</td>
                      <td>{`تجميع شهر ${t.date.split('/')[1]}`}</td>
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

export default Total
