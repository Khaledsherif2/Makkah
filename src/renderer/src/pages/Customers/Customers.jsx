import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Customers.css'
import Loader from '../../components/Loader/Loader'
import { getAllUsers, searchUsers, addTransaction } from '../../../../services/ipcRenderer'
import Swal from 'sweetalert2'
import { Toast } from '../../utils/Toast'
import debounce from 'lodash.debounce'

const Customers = () => {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const formatDate = useCallback((date) => {
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `${year}/${month}/${day}`
  })

  const formatDataToSchema = useCallback((user) => {
    if (!user.data) {
      Toast.fire({
        icon: 'error',
        title: `بيانات العميل غير معرفه :${user}`
      })
      return null
    }
    return {
      userId: user.id,
      date: formatDate(new Date()),
      code: user.data.code.toString(),
      price: user.data.totalPrice,
      carpetPrice: user.data.carpetPrice,
      blanketPrice:
        user.data.blanketsPrice[user.data.blanketsPrice.length - 1]?.totalPrice.toString()
    }
  })

  const fetchUsers = useCallback(async () => {
    if (searchTerm) {
      await searchUsers(searchTerm, setIsLoading, setUsers)
    } else {
      await getAllUsers(setIsLoading, setUsers)
    }
  }, [searchTerm])

  const debouncedSearch = useCallback(
    debounce(() => {
      fetchUsers()
    }, 800),
    [fetchUsers]
  )

  useEffect(() => {
    debouncedSearch()
  }, [searchTerm, debouncedSearch])

  const handleView = (user) => {
    navigate('/details', { state: { user } })
  }

  const handleDone = async (user) => {
    const transaction = formatDataToSchema(user)
    Swal.fire({
      title: ` متأكد من انه تم التسليم للعميل : (الكود "${user.data.code}", الاسم "${user.name}" ؟)`,
      showCancelButton: true,
      cancelButtonText: 'إلغاء',
      confirmButtonText: 'تمام 👍',
      confirmButtonColor: '#187bcd'
    }).then(async (data) => {
      if (data.isConfirmed) {
        if (transaction) {
          await addTransaction(transaction, navigate)
        }
      }
    })
  }

  return (
    <div className="customers mt-2">
      <div className="container-fluid">
        <div className="search-bar">
          <input placeholder="بحث" type="text" onChange={(e) => setSearchTerm(e.target.value)} />
          <button
            className="add-product"
            onClick={() => {
              navigate('/addCustomer')
            }}
          >
            اضافه عميل
          </button>
        </div>
        {isLoading ? (
          <Loader />
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>الكود</th>
                <th>الاسم</th>
                <th>التليفون</th>
                <th>السعر</th>
                <th>التاريخ</th>
                <th>العمليات</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className={user.status === 'done' ? 'done' : ''}>
                    <td>{user.data.code}</td>
                    <td>{user.name}</td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>{user.data.totalPrice || 'N/A'}</td>
                    <td>{user.date || 'N/A'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleView(user)}
                      >
                        عرض
                      </button>
                      {user.status === 'pending' && (
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={() => handleDone(user)}
                        >
                          تم الانتهاء !
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">لا توجد عملاء</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Customers
