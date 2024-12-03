import { Toast } from '../../src/renderer/src/utils/Toast'

export const saveUser = async (user, navigate) => {
  try {
    const res = await window.electron.ipcRenderer.invoke('toMain', {
      action: 'saveUser',
      user
    })

    if (res.status === 'success') {
      Toast.fire({
        icon: 'success',
        title: 'تم اضافة العميل بنجاح'
      })
      navigate('/customers')
    } else {
      Toast.fire({
        icon: 'error',
        title: 'حدث خطأ: ' + res.message
      })
    }
  } catch (e) {
    Toast.fire({
      icon: 'error',
      title: 'حدث خطأ: ' + e.message
    })
  }
}

export const getAllUsers = async (setIsLoading, setUsers) => {
  setIsLoading(true)

  try {
    const res = await window.electron.ipcRenderer.invoke('toMain', { action: 'getAllUsers' })
    if (res.status === 'success') {
      setUsers(res.users)
    } else {
      Toast.fire({
        icon: 'error',
        title: 'حدث خطأ أثناء تحميل العملاء : ' + res.message
      })
    }
  } catch (e) {
    Toast.fire({
      icon: 'error',
      title: 'حدث خطأ: ' + e.message
    })
  } finally {
    setIsLoading(false)
  }
}

export const searchUsers = async (searchTerm, setIsLoading, setUsers) => {
  setIsLoading(true)

  try {
    const res = await window.electron.ipcRenderer.invoke('toMain', {
      action: 'searchUsers',
      searchTerm
    })

    setIsLoading(false)
    if (res.status === 'success') {
      setUsers(res.results)
    } else {
      Toast.fire({
        icon: 'error',
        title: 'حدث خطأ أثناء البحث: ' + res.message
      })
    }
  } catch (e) {
    setIsLoading(false)
    Toast.fire({
      icon: 'error',
      title: 'حدث خطأ: ' + e.message
    })
  }
}

export const editUser = async (userId, updatedUser, navigate) => {
  try {
    const res = await window.electron.ipcRenderer.invoke('toMain', {
      action: 'editUser',
      userId,
      updatedUser
    })
    if (res.status === 'success') {
      Toast.fire({
        icon: 'success',
        title: 'تم تعديل العميل بنجاح'
      })
      navigate('/customers')
    } else {
      Toast.fire({
        icon: 'error',
        title: 'حدث خطأ أثناء تعديل بيانات العميل: ' + res.message
      })
    }
  } catch (e) {
    Toast.fire({
      icon: 'error',
      title: 'حدث خطأ: ' + e.message
    })
    throw e
  }
}

export const deleteUser = async (userId, setEdit, navigate) => {
  try {
    const res = await window.electron.ipcRenderer.invoke('toMain', {
      action: 'deleteUser',
      userId
    })
    if (res.status === 'success') {
      Toast.fire({
        icon: 'success',
        title: 'تم حذف العميل بنجاح'
      })
      setEdit(false)
      navigate('/customers')
    } else {
      Toast.fire({
        icon: 'error',
        title: 'حدث خطأ أثناء حذف بيانات العميل: ' + res.message
      })
    }
  } catch (e) {
    Toast.fire({
      icon: 'error',
      title: 'حدث خطأ: ' + e.message
    })
    throw e
  }
}

export const addTransaction = async (transaction, navigate) => {
  try {
    const res = await window.electron.ipcRenderer.invoke('toMain', {
      action: 'addTransaction',
      transaction
    })
    Toast.fire({
      icon: 'success',
      title: 'تم إضافة العملية المالية بنجاح'
    })
    navigate('/finances')
    return res
  } catch (e) {
    Toast.fire({
      icon: 'error',
      title: 'حدث خطأ: ' + e.message
    })
    throw e
  }
}

export const addPayment = async (payment, navigate) => {
  try {
    const res = await window.electron.ipcRenderer.invoke('toMain', {
      action: 'addPayment',
      payment
    })
    Toast.fire({
      icon: 'success',
      title: 'تم إضافة المصروفات بنجاح'
    })
    navigate('/finances')
    return res
  } catch (e) {
    Toast.fire({
      icon: 'error',
      title: 'حدث خطأ أثناء إضافة المصروفات: ' + e.message
    })
    throw e
  }
}

export const getAllTransactions = async () => {
  try {
    const res = await window.electron.ipcRenderer.invoke('toMain', {
      action: 'getAllTransactions'
    })
    return res
  } catch (e) {
    Toast.fire({
      icon: 'error',
      title: 'حدث خطأ: ' + e.message
    })
    throw e
  }
}

export const getAllPayments = async () => {
  try {
    const res = await window.electron.ipcRenderer.invoke('toMain', {
      action: 'getAllPayments'
    })
    return res
  } catch (e) {
    Toast.fire({
      icon: 'error',
      title: 'حدث خطأ: ' + e.message
    })
    throw e
  }
}

export const filterTransactions = async (filterTerm) => {
  try {
    const res = await window.electron.ipcRenderer.invoke('toMain', {
      action: 'filterTransactions',
      filterTerm
    })
    return res
  } catch (e) {
    Toast.fire({
      icon: 'error',
      title: 'حدث خطأ: ' + e.message
    })
    throw e
  }
}

export const addTotalTransaction = async (transaction) => {
  try {
    const res = await window.electron.ipcRenderer.invoke('toMain', {
      action: 'addTotalTransaction',
      transaction
    })
    return res
  } catch (e) {
    Toast.fire({
      icon: 'error',
      title: 'حدث خطأ: ' + e.message
    })
    throw e
  }
}

export const getTotalTransactions = async () => {
  try {
    const res = await window.electron.ipcRenderer.invoke('toMain', {
      action: 'getTotalTransactions'
    })
    return res
  } catch (e) {
    Toast.fire({
      icon: 'error',
      title: 'حدث خطأ: ' + e.message
    })
    throw e
  }
}

export const uploadFiles = async () => {
  try {
    const res = await window.electron.ipcRenderer.invoke('toMain', {
      action: 'uploadFiles'
    })
    return res
  } catch (e) {
    Toast.fire({
      icon: 'error',
      title: 'حدث خطأ: ' + e.message
    })
    throw e
  }
}
