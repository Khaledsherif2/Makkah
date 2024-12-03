import './Home.css'
import logo from '../../assets/images/logo.png'
import { uploadFiles } from '../../../../services/ipcRenderer'
import { Toast } from '../../utils/Toast'
import Swal from 'sweetalert2'
import { useEffect } from 'react'

const Home = () => {
  useEffect(() => {
    window.api.sendTimeBasedNotification(21, 0, 'تذكير', 'لا تنسي رفع الملفات')
  }, [])
  const handleUpload = async () => {
    const isOnline = window.api.isOnline()
    if (!isOnline) {
      Toast.fire({
        icon: 'warning',
        title: 'لا يوجد اتصال بالانترنت حاول لاحقا'
      })
    } else {
      Swal.fire({
        title: 'هل تريد رفع الملفات ؟',
        showCancelButton: true,
        cancelButtonText: 'لا, الغاء',
        confirmButtonText: ' نعم حفظ',
        confirmButtonColor: '#187bcd',
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then((result) => {
        if (result.isConfirmed) {
          uploadFiles()
            .then((res) => {
              if (res.status === 'success') {
                Swal.fire('تم رفع الملفات بنجاح', '', 'success')
              } else {
                Swal.fire('حدث خطأ اثناء رفع الملفات', `${res.message}`, 'error')
              }
            })
            .catch((e) => {
              Swal.fire('حدث خطأ اثناء رفع الملفات', `${e.message}`, 'error')
            })
        } else if (result.isDismissed) {
          Swal.fire('لم يتم رفع الملفات', '', 'info')
        }
      })
    }
  }
  return (
    <div className="home">
      <div className="circle">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <button className="btn btn-primary uploadBtn" onClick={handleUpload}>
        اضغط لرفع الملفات
      </button>
    </div>
  )
}

export default Home
