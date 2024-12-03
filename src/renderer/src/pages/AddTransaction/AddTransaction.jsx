import { useCallback, useState } from 'react'
import { Toast } from '../../utils/Toast'
import { useNavigate } from 'react-router-dom'
import './AddTransaction.css'
import { addTransaction, addPayment } from '../../../../services/ipcRenderer'
import Swal from 'sweetalert2'

const AddTransaction = () => {
  const formatDate = useCallback((date) => {
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `${year}/${month}/${day}`
  })
  const navigate = useNavigate()

  const [inputFields, setInputFields] = useState({
    date: formatDate(new Date()),
    code: '',
    price: '',
    carpetPrice: '',
    blanketPrice: '',
    cash: '',
    types: ''
  })

  const handleChange = (e) => {
    setInputFields({ ...inputFields, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { date, code, price, carpetPrice, blanketPrice } = inputFields
    const transaction = { date, code, price, carpetPrice, blanketPrice }
    Swal.fire({
      title: `متأكد من اضافة المعامله : (الكود "${code}", السعر "${price}", سجاد "${carpetPrice}", بطاطين "${blanketPrice}" ؟)`,
      showCancelButton: true
    }).then(async (data) => {
      if (data.isConfirmed) {
        if (date && code && price) {
          try {
            const res = await addTransaction(transaction, navigate)
            if (res.status === 'success') {
              Toast.fire({
                icon: 'success',
                title: 'تمت العملية بنجاح'
              })
            } else {
              Toast.fire({
                icon: 'error',
                title: ('حدث خطأ', res.message)
              })
            }
          } catch (e) {
            Toast.fire({
              icon: 'error',
              title: `حدث خطأ في الاتصال: ${e.message}`
            })
          }
        }
      }
    })
  }

  const handlePayments = async (e) => {
    e.preventDefault()
    const { cash, types, date } = inputFields
    const payment = { cash, types, date }
    Swal.fire({
      title: `متأكد من اضافه المصروفات "${cash}" الذي تصنيفها "${types}" ؟`,
      showCancelButton: true
    }).then(async (data) => {
      if (data.isConfirmed) {
        if (cash && types) {
          try {
            const res = await addPayment(payment, navigate)
            if (res.status === 'success') {
              Toast.fire({
                icon: 'success',
                title: 'تمت العملية بنجاح'
              })
            } else {
              Toast.fire({
                icon: 'error',
                title: ('حدث خطأ', res.message)
              })
            }
          } catch (e) {
            Toast.fire({
              icon: 'error',
              title: `حدث خطأ في الاتصال: ${e.message}`
            })
          }
        }
      }
    })
  }

  return (
    <div className="finance">
      <div className="container-fluid">
        <form className="d-flex flex-column gap-4" onSubmit={(e) => handleSubmit(e)}>
          <div className="fs-3"> اضافه معاملة :</div>
          <div className="row">
            <div className="col">
              <input
                type="text"
                name="code"
                className="form-control"
                placeholder="الكود"
                onChange={handleChange}
              />
            </div>
            <div className="col">
              <input
                type="text"
                name="price"
                className="form-control"
                placeholder="الحساب"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <input
                type="text"
                name="carpetPrice"
                className="form-control"
                placeholder="سجاد"
                onChange={handleChange}
              />
            </div>
            <div className="col">
              <input
                type="text"
                name="blanketPrice"
                className="form-control"
                placeholder="بطاطين"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <button type="submit" className="btn form-control">
                اضافة
              </button>
            </div>
          </div>
        </form>
        <form className="d-flex flex-column gap-4" onSubmit={handlePayments}>
          <div className="fs-3">اضافه مصروفات :</div>
          <div className="row">
            <div className="col">
              <input
                type="text"
                name="cash"
                className="form-control"
                placeholder="نقدي"
                onChange={handleChange}
              />
            </div>
            <div className="col">
              <input
                type="text"
                name="types"
                className="form-control"
                placeholder="اصناف"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <button type="submit" className="btn form-control">
                اضافة
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTransaction
