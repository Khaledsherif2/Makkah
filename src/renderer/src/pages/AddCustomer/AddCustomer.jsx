import './AddCustomer.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Toast } from '../../utils/Toast'
import { saveUser } from '../../../../services/ipcRenderer'
import Meters from '../../components/Meters/Meters'
import Blankets from '../../components/Blankets/Blankets'

const AddCustomer = () => {
  const navigate = useNavigate()
  const formatDate = (date) => {
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: formatDate(new Date()),
    data: {
      item1: '',
      item2: '',
      item3: '',
      item4: '',
      item5: '',
      item6: '',
      item7: '',
      meters: [],
      carpetPrice: '',
      blanketsPrice: [],
      totalPrice: '',
      deposite: '',
      balance: ''
    }
  })

  useEffect(() => {
    const lastMeterPrice = (
      formData.data.meters[formData.data.meters.length - 1]?.totalPrice || 0
    ).toString()
    const lastBlanketPrice = (
      formData.data.blanketsPrice[formData.data.blanketsPrice.length - 1]?.totalPrice || 0
    ).toString()

    setFormData((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        carpetPrice: lastMeterPrice,
        totalPrice: (+lastMeterPrice + +lastBlanketPrice).toString()
      }
    }))
  }, [formData.data.meters, formData.data.blanketsPrice])

  useEffect(() => {
    const balance = (formData.data.totalPrice - formData.data.deposite).toString()

    setFormData((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        balance: balance < 0 ? 0 : balance
      }
    }))
  }, [formData.data.totalPrice, formData.data.deposite])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name in formData.data) {
      setFormData((prevState) => ({
        ...prevState,
        data: {
          ...prevState.data,
          [name]: value
        }
      }))
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name) {
      Toast.fire({
        icon: 'error',
        title: 'يرجى ادخال اسم العميل'
      })
    } else if (
      (formData.data.meters[formData.data.meters.length - 1]?.totalNum || 0) !==
      +formData.data.item1 + +formData.data.item2 + +formData.data.item3 + +formData.data.item4
    ) {
      Toast.fire({
        icon: 'error',
        title: 'يرجي مراجعه عدد السجاد'
      })
    } else if (
      (formData.data.blanketsPrice[formData.data.blanketsPrice.length - 1]?.totalNum || 0) !==
      +formData.data.item5 + +formData.data.item6 + +formData.data.item7
    ) {
      Toast.fire({
        icon: 'error',
        title: 'يرجي مراجعه عدد البطاطين'
      })
    } else {
      try {
        await saveUser(formData, navigate)
      } catch (e) {
        Toast.fire({
          icon: 'error',
          title: ' حدث خطأ اثناء اضافه بيانات العميل : ' + e.message
        })
      }
    }
  }

  return (
    <div className="addCustomer">
      <div className="container">
        <form className="d-flex flex-column gap-4" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col">
              <label>الاسم :</label>
              <input type="text" name="name" className="form-control" onChange={handleChange} />
            </div>
            <div className="col">
              <label>التليفون :</label>
              <input type="text" name="phone" className="form-control" onChange={handleChange} />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <label>سجاد :</label>
              <input type="number" name="item1" className="form-control" onChange={handleChange} />
            </div>
            <div className="col">
              <label>مشايه :</label>
              <input type="number" name="item2" className="form-control" onChange={handleChange} />
            </div>
            <div className="col">
              <label>عتب :</label>
              <input type="number" name="item3" className="form-control" onChange={handleChange} />
            </div>
            <div className="col">
              <label>موكيت :</label>
              <input type="number" name="item4" className="form-control" onChange={handleChange} />
            </div>
            <div className="col">
              <label>حافظة :</label>
              <input type="number" name="item5" className="form-control" onChange={handleChange} />
            </div>
            <div className="col">
              <label>بطانيه :</label>
              <input type="number" name="item6" className="form-control" onChange={handleChange} />
            </div>
            <div className="col">
              <label>لحاف :</label>
              <input type="number" name="item7" className="form-control" onChange={handleChange} />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <label>الأمتار :</label>
              <Meters setFormData={setFormData} />
            </div>
            <div className="col">
              <label>سعرالسجاد :</label>
              <input
                type="number"
                name="carpetPrice"
                className="form-control"
                value={formData.data.carpetPrice}
                onChange={handleChange}
              />
            </div>
            <div className="col">
              <label>سعر البطاطين :</label>
              <Blankets setFormData={setFormData} />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <label>الحساب :</label>
              <input
                type="number"
                name="totalPrice"
                className="form-control"
                value={formData.data.totalPrice}
                onChange={handleChange}
              />
            </div>
            <div className="col">
              <label>المقدم :</label>
              <input
                type="number"
                name="deposite"
                className="form-control"
                value={formData.data.deposite}
                onChange={handleChange}
              />
            </div>
            <div className="col">
              <label>الباقي :</label>
              <input
                type="number"
                name="balance"
                className="form-control"
                value={formData.data.balance}
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

export default AddCustomer
