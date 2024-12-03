import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Details.css'
import { editUser, deleteUser } from '../../../../services/ipcRenderer'
import { Toast } from '../../utils/Toast'
import Swal from 'sweetalert2'
import Meters from '../../components/Meters/Meters'
import Blankets from '../../components/Blankets/Blankets'

const Details = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { user } = state || {}
  const [edit, setEdit] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    data: {
      code: user.data.code,
      item1: user.data.item1 || '',
      item2: user.data.item2 || '',
      item3: user.data.item3 || '',
      item4: user.data.item4 || '',
      item5: user.data.item5 || '',
      item6: user.data.item6 || '',
      item7: user.data.item7 || '',
      meters: user.data.meters || [],
      carpetPrice: user.data.carpetPrice || '',
      blanketsPrice: user.data.blanketsPrice || [],
      totalPrice: user.data.totalPrice || '',
      deposite: user.data.deposite || '',
      balance: user.data.balance || ''
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
    setFormData((prevData) => {
      if (name.startsWith('data.')) {
        const fieldName = name.split('.')[1]
        return {
          ...prevData,
          data: {
            ...prevData.data,
            [fieldName]: value
          }
        }
      } else {
        return {
          ...prevData,
          [name]: value
        }
      }
    })
  }

  const handleEdit = async (e) => {
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
        await editUser(user.id, formData, navigate)
        setEdit(false)
      } catch (e) {
        Toast.fire({
          icon: 'error',
          title: ' حدث خطأ اثناء تحديث بيانات العميل : ' + e.message
        })
      }
    }
  }

  const handleDelete = (user) => {
    Swal.fire({
      title: `هل متأكد من حذف العميل الذى اسمه : ${user.name} ؟`,
      text: 'لن تتمكن من التراجع عن هذا !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#187bcd',
      cancelButtonColor: '#d33',
      confirmButtonText: 'نعم ، احذفه !',
      cancelButtonText: 'إلغاء'
    }).then(async (data) => {
      if (data.isConfirmed) {
        try {
          Swal.fire({
            title: 'تم الحذف!',
            text: 'لقد تم حذف العميل.',
            icon: 'success'
          })
          await deleteUser(user.id, setEdit, navigate)
          setEdit(false)
        } catch (e) {
          Toast.fire({
            icon: 'error',
            title: 'حدث خطأ أثناء حذف بيانات العميل :' + e.message
          })
        }
      }
    })
  }

  const handleClick = () => {
    const meters = user.data.meters.slice(0, -1)
    const rows = meters
      .map(
        (meter) => `
        <tr>
          <td>${meter.inputOne}</td>
          <td>${meter.inputTwo}</td>
          <td>${meter.inputThree}</td>
          <td>${meter.meters}</td>
          <td>${meter.meterPrice}</td>
          <td>${meter.price}</td>
        </tr>
      `
      )
      .join('')

    const html = `
      <table class="table table-primary">
        <thead>
          <tr>
            <th>المدخل الاول</th>
            <th>المدخل التاني</th>
            <th>العدد</th>
            <th>الأمتار</th>
            <th>سعر المتر</th>
            <th>السعر</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `

    Swal.fire({
      title: 'الأمتار',
      html: html
    })
  }

  const handleDbClick = () => {
    const Blankets = user.data.blanketsPrice?.slice(0, -1)
    const rows = Blankets.map(
      (blanket) => `
        <tr>
          <td>${blanket.inputOne}</td>
          <td>${blanket.inputTwo}</td>
          <td>${blanket.price}</td>
        </tr>
      `
    ).join('')

    const html = `
      <table class="table table-primary">
        <thead>
          <tr>
            <th>العدد</th>
            <th>سعر البطانيه</th>
            <th>السعر</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `

    Swal.fire({
      title: 'البطاطين',
      html: html
    })
  }

  return (
    <div className="details">
      <div className="container">
        {user && !edit ? (
          <>
            <h2>بيانات العميل :</h2>
            <form className="d-flex flex-column gap-4">
              <div className="row">
                <div className="col">
                  <label>الحالة :</label>
                  <input
                    type="text"
                    name="status"
                    className="form-control"
                    value={user.status === 'done' ? 'تم التسليم' : 'لم يتم التسليم بعد'}
                    readOnly
                  />
                </div>
                <div className="col">
                  <label>الاسم :</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={user.name || ''}
                    readOnly
                  />
                </div>
                <div className="col">
                  <label>التليفون :</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    value={user.phone || ''}
                    readOnly
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label>سجاد :</label>
                  <input
                    type="number"
                    name="item1"
                    className="form-control"
                    value={user.data.item1 || 0}
                    readOnly
                  />
                </div>
                <div className="col">
                  <label>مشايه :</label>
                  <input
                    type="number"
                    name="item2"
                    className="form-control"
                    value={user.data.item2 || 0}
                    readOnly
                  />
                </div>
                <div className="col">
                  <label>عتب :</label>
                  <input
                    type="number"
                    name="item3"
                    className="form-control"
                    value={user.data.item3 || 0}
                    readOnly
                  />
                </div>
                <div className="col">
                  <label>موكيت :</label>
                  <input
                    type="number"
                    name="item4"
                    className="form-control"
                    value={user.data.item4 || 0}
                    readOnly
                  />
                </div>
                <div className="col">
                  <label>حافظة :</label>
                  <input
                    type="number"
                    name="item5"
                    className="form-control"
                    value={user.data.item5 || 0}
                    readOnly
                  />
                </div>
                <div className="col">
                  <label>بطانيه :</label>
                  <input
                    type="number"
                    name="item6"
                    className="form-control"
                    value={user.data.item6 || 0}
                    readOnly
                  />
                </div>
                <div className="col">
                  <label>لحاف :</label>
                  <input
                    type="number"
                    name="item7"
                    className="form-control"
                    value={user.data.item7 || 0}
                    readOnly
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label>الأمتار :</label>
                  <input
                    type="string"
                    name="meters"
                    className="form-control"
                    value={`${user.data.meters[user.data.meters.length - 1]?.totalMeters || 0}متر (اضغط مرتين لعرض التفاصيل)`}
                    onDoubleClick={handleClick}
                    readOnly
                  />
                </div>
                <div className="col">
                  <label>سعرالسجاد :</label>
                  <input
                    type="number"
                    name="carpetPrice"
                    className="form-control"
                    value={user.data.carpetPrice || 0}
                    readOnly
                  />
                </div>
                <div className="col">
                  <label>سعر البطاطين :</label>
                  <input
                    type="string"
                    name="blanketsPrice"
                    className="form-control"
                    value={`${user.data.blanketsPrice[user.data.blanketsPrice.length - 1]?.totalPrice || 0}ج (اضغط مرتين لعرض التفاصيل)`}
                    onDoubleClick={handleDbClick}
                    readOnly
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label>الحساب :</label>
                  <input
                    type="number"
                    name="totalPrice"
                    className="form-control"
                    value={user.data.totalPrice || 0}
                    readOnly
                  />
                </div>
                <div className="col">
                  <label>المقدم :</label>
                  <input
                    type="number"
                    name="deposite"
                    className="form-control"
                    value={user.data.deposite || 0}
                    readOnly
                  />
                </div>
                <div className="col">
                  <label>الباقي :</label>
                  <input
                    type="number"
                    name="balance"
                    className="form-control"
                    value={user.data.balance || 0}
                    readOnly
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <button type="button" className="edit form-control" onClick={() => setEdit(true)}>
                    تعديل
                  </button>
                </div>
                <div className="col">
                  <button
                    type="button"
                    className="del btn btn-danger form-control"
                    onClick={() => handleDelete(user)}
                  >
                    حذف
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : user && edit ? (
          <>
            <h2>تعديل بيانات العميل :</h2>
            <form className="d-flex flex-column gap-4" onSubmit={handleEdit}>
              <div className="row">
                <div className="col">
                  <label>الاسم :</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label>التليفون :</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label>سجاد :</label>
                  <input
                    type="number"
                    name="data.item1"
                    className="form-control"
                    value={formData.data.item1}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label>مشايه :</label>
                  <input
                    type="number"
                    name="data.item2"
                    className="form-control"
                    value={formData.data.item2}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label>عتب :</label>
                  <input
                    type="number"
                    name="data.item3"
                    className="form-control"
                    value={formData.data.item3}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label>موكيت :</label>
                  <input
                    type="number"
                    name="data.item4"
                    className="form-control"
                    value={formData.data.item4}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label>حافظة :</label>
                  <input
                    type="number"
                    name="data.item5"
                    className="form-control"
                    value={formData.data.item5}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label>بطانيه :</label>
                  <input
                    type="number"
                    name="data.item6"
                    className="form-control"
                    value={formData.data.item6}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label>لحاف :</label>
                  <input
                    type="number"
                    name="data.item7"
                    className="form-control"
                    value={formData.data.item7}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label>الأمتار :</label>
                  <Meters setFormData={setFormData} user={user} edit={true} />
                </div>
                <div className="col">
                  <label>سعرالسجاد :</label>
                  <input
                    type="number"
                    name="data.carpetPrice"
                    className="form-control"
                    value={formData.data.carpetPrice}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label>سعر البطاطين :</label>
                  <Blankets setFormData={setFormData} user={user} edit={true} />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label>الحساب :</label>
                  <input
                    type="number"
                    name="data.totalPrice"
                    className="form-control"
                    value={formData.data.totalPrice}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label>المقدم :</label>
                  <input
                    type="number"
                    name="data.deposite"
                    className="form-control"
                    value={formData.data.deposite}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label>الباقي :</label>
                  <input
                    type="number"
                    name="data.balance"
                    className="form-control"
                    value={formData.data.balance}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <button
                    type="reset"
                    className="form-control btn btn-secondary"
                    onClick={() => setEdit(false)}
                  >
                    الغاء
                  </button>
                </div>
                <div className="col">
                  <button type="submit" className="form-control btn btn-success">
                    حفظ
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <p>No user data available</p>
        )}
      </div>
    </div>
  )
}

export default Details
