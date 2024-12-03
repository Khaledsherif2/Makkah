const { ipcMain } = require('electron')
const { v4: uuidv4 } = require('uuid')
const { app } = require('electron')
const path = require('node:path')
const { initializeApp } = require('firebase/app')
const { getStorage } = require('firebase/storage')
const { ref, uploadBytes, getDownloadURL, deleteObject } = require('firebase/storage')

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
}

const firebaseApp = initializeApp(firebaseConfig)
const storage = getStorage(firebaseApp)

const saveToStorage = async (filePath, folder, mimeType, storeFileName) => {
  try {
    const fileName = `${storeFileName}.${mimeType.split('/')[1]}`
    const storageRef = ref(storage, `${folder}/${fileName}`)
    const metadata = { contentType: mimeType }

    const existingFileRef = ref(storage, `${folder}/${fileName}`)
    try {
      await deleteObject(existingFileRef)
    } catch (error) {
      if (error.code !== 'storage/object-not-found') {
        throw new Error('Failed to delete existing file: ' + error.message)
      }
    }

    const fs = require('fs')
    const fileBuffer = fs.readFileSync(filePath)

    const snapshot = await uploadBytes(storageRef, fileBuffer, metadata)
    const downloadURL = await getDownloadURL(snapshot.ref)

    return {
      downloadURL,
      fullPath: storageRef.fullPath
    }
  } catch (e) {
    throw {
      statusCode: 500,
      message: 'Failed to upload to Firebase',
      error: e.message
    }
  }
}

let userStore, transactionStore, paymentsStore, totalStore
const folderPath = path.join(app.getPath('userData'), 'appData')
const initStores = async () => {
  if (userStore && transactionStore && paymentsStore && totalStore) return

  const module = await import('electron-store')
  const Store = module.default

  const userSchema = {
    users: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          phone: { type: 'string' },
          date: { type: 'string' },
          status: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              code: { type: 'number' },
              item1: { type: 'string' },
              item2: { type: 'string' },
              item3: { type: 'string' },
              item4: { type: 'string' },
              item5: { type: 'string' },
              item6: { type: 'string' },
              item7: { type: 'string' },
              meters: { type: 'array' },
              carpetPrice: { type: 'string' },
              blanketPrice: { type: 'array' },
              totalPrice: { type: 'string' },
              deposite: { type: 'string' },
              balance: { type: 'string' }
            }
          }
        },
        required: ['id', 'name']
      }
    }
  }

  const transactionSchema = {
    transactions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          date: { type: 'string' },
          code: { type: 'string' },
          price: { type: 'string' },
          carpetPrice: { type: 'string' },
          blanketPrice: { type: 'string' }
        },
        required: ['id']
      }
    }
  }

  const paymentsSchema = {
    payments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          cash: { type: 'string' },
          types: { type: 'string' },
          date: { type: 'string' }
        },
        required: ['id']
      }
    }
  }

  const totalSchema = {
    totalTransactions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          date: { type: 'string' },
          code: { type: 'string' },
          totalPrice: { type: 'number' },
          totalCPrice: { type: 'number' },
          totalBPrice: { type: 'number' },
          totalPayments: { type: 'number' }
        },
        required: ['id']
      }
    }
  }

  userStore = new Store({
    schema: userSchema,
    name: 'users',
    cwd: folderPath,
    clearInvalidConfig: true,
    serialize: (data) => JSON.stringify(data),
    deserialize: (data) => JSON.parse(data)
  })

  transactionStore = new Store({
    schema: transactionSchema,
    name: 'transactions',
    cwd: folderPath,
    clearInvalidConfig: true,
    serialize: (data) => JSON.stringify(data),
    deserialize: (data) => JSON.parse(data)
  })

  paymentsStore = new Store({
    schema: paymentsSchema,
    name: 'payments',
    cwd: folderPath,
    clearInvalidConfig: true,
    serialize: (data) => JSON.stringify(data),
    deserialize: (data) => JSON.parse(data)
  })

  totalStore = new Store({
    schema: totalSchema,
    name: 'totalTransactions',
    cwd: folderPath,
    clearInvalidConfig: true,
    serialize: (data) => JSON.stringify(data),
    deserialize: (data) => JSON.parse(data)
  })

  initializeUsersArray()
}

const initializeUsersArray = () => {
  if (!userStore.has('users')) {
    userStore.set('users', [])
  }
}

const ensureStoresInitialized = async () => {
  if (!userStore || !transactionStore || !paymentsStore || !totalStore) await initStores()
}

const generateCode = async () => {
  await ensureStoresInitialized()
  let currentCode = userStore.get('currentCode', 99)
  currentCode++
  if (currentCode > 1099) {
    currentCode = 99
  }
  userStore.set('currentCode', currentCode)
  return currentCode
}

const saveUser = async (user) => {
  await ensureStoresInitialized()
  if (!user.id) {
    user.id = uuidv4()
  }
  user.status = 'pending'
  user.data.code = await generateCode()
  const users = userStore.get('users', [])
  users.push(user)
  userStore.set('users', users)
  return user
}

const getAllUsers = async () => {
  await ensureStoresInitialized()
  const users = userStore.get('users', [])
  return users
}

const changeStatus = async (userId) => {
  await ensureStoresInitialized()
  const users = userStore.get('users', [])
  const userIndex = users.findIndex((user) => user.id === userId)
  if (userIndex === -1) {
    throw new Error('User not found')
  } else {
    users[userIndex].status = users[userIndex].status === 'pending' ? 'done' : 'pending'
    userStore.set('users', users)
  }
}

const searchUsers = async (searchTerm) => {
  await ensureStoresInitialized()
  const users = userStore.get('users', [])
  return users.filter(
    (user) => user.name.includes(searchTerm) || String(user.data.code).includes(searchTerm)
  )
}

const editUser = (userId, updatedUser) => {
  const users = userStore.get('users', [])
  const userIndex = users.findIndex((user) => user.id === userId)
  if (userIndex === -1) {
    throw new Error('User not found')
  }
  const userToUpdate = users[userIndex]
  users[userIndex] = { ...userToUpdate, ...updatedUser }
  userStore.set('users', users)
  return users[userIndex]
}

const deleteUser = async (userId) => {
  await ensureStoresInitialized()
  const users = userStore.get('users', [])
  const updatedUsers = users.filter((user) => user.id !== userId)
  if (updatedUsers.length === users.length) {
    throw new Error('User not found')
  }
  userStore.set('users', updatedUsers)
  return true
}

const saveTransaction = async (transaction) => {
  await ensureStoresInitialized()
  if (!transaction.id) {
    transaction.id = uuidv4()
  }
  const transactions = transactionStore.get('transactions', [])
  transactions.push(transaction)
  transactionStore.set('transactions', transactions)
  return transaction
}

const getAllTransactions = async () => {
  await ensureStoresInitialized()
  const transactions = transactionStore.get('transactions', [])
  return transactions
}

const saveTotalTransaction = async (transaction) => {
  await ensureStoresInitialized()
  if (!transaction.id) {
    transaction.id = uuidv4()
  }
  const transactions = totalStore.get('totalTransactions', [])
  transactions.push(transaction)
  totalStore.set('totalTransactions', transactions)
  return transaction
}

const getTotalTransactions = async () => {
  await ensureStoresInitialized()
  const transactions = totalStore.get('totalTransactions', [])
  return transactions
}

const filterTransactions = async (filterTerm) => {
  await ensureStoresInitialized()
  const transactions = transactionStore.get('transactions', [])
  return transactions.filter((transaction) => transaction.date.includes(filterTerm))
}

const savePayments = async (payment) => {
  await ensureStoresInitialized()
  if (!payment.id) {
    payment.id = uuidv4()
  }
  const payments = paymentsStore.get('payments', [])
  payments.push(payment)
  paymentsStore.set('payments', payments)
  return payment
}

const getAllPayments = async (filterTerm) => {
  await ensureStoresInitialized()
  const payments = paymentsStore.get('payments', [])
  if (filterTerm) {
    return payments.filter((payment) => payment.date.includes(filterTerm))
  } else {
    return payments
  }
}

const uploadStoreFile = async (storeFileName) => {
  try {
    const filePath = path.join(folderPath, `${storeFileName}.json`)
    const fileMimeType = 'application/json'
    const folder = 'electron-store-backups'

    const fs = require('fs')
    if (!fs.existsSync(filePath)) {
      console.error(`File ${storeFileName} does not exist.`)
      return
    }
    const result = await saveToStorage(filePath, folder, fileMimeType, storeFileName)
    return result
  } catch (error) {
    console.error(`Failed to upload ${storeFileName}: ${error.message}`)
    throw error
  }
}

ipcMain.handle('toMain', async (_, args) => {
  if (args.action === 'saveUser') {
    try {
      const savedUser = await saveUser(args.user)
      return JSON.parse(JSON.stringify({ status: 'success', user: savedUser }))
    } catch (error) {
      return JSON.parse(JSON.stringify({ status: 'error', message: error.message }))
    }
  } else if (args.action === 'getAllUsers') {
    try {
      const users = await getAllUsers()
      return { status: 'success', users }
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  } else if (args.action === 'searchUsers') {
    try {
      const results = await searchUsers(args.searchTerm)
      return JSON.parse(JSON.stringify({ status: 'success', results }))
    } catch (error) {
      return JSON.parse(JSON.stringify({ status: 'error', message: error.message }))
    }
  } else if (args.action === 'editUser') {
    try {
      const updatedUser = await editUser(args.userId, args.updatedUser)
      return { status: 'success', user: updatedUser }
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  } else if (args.action === 'deleteUser') {
    try {
      await deleteUser(args.userId)
      return { status: 'success', message: 'User deleted successfully' }
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  } else if (args.action === 'addTransaction') {
    try {
      const savedTransaction = await saveTransaction(args.transaction)
      if (args.transaction.userId) {
        await changeStatus(args.transaction.userId)
      }
      return JSON.parse(
        JSON.stringify({
          status: 'success',
          transaction: savedTransaction
        })
      )
    } catch (error) {
      return JSON.parse(JSON.stringify({ status: 'error', message: error.message }))
    }
  } else if (args.action === 'getAllTransactions') {
    try {
      const transactions = await getAllTransactions()
      return { status: 'success', transactions }
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  } else if (args.action === 'addTotalTransaction') {
    try {
      const savedTransaction = await saveTotalTransaction(args.transaction)
      if (args.transaction.userId) {
        await changeStatus(args.transaction.userId)
      }
      return JSON.parse(JSON.stringify({ status: 'success', transaction: savedTransaction }))
    } catch (error) {
      return 'fromMain', JSON.parse(JSON.stringify({ status: 'error', message: error.message }))
    }
  } else if (args.action === 'getTotalTransactions') {
    try {
      const transactions = await getTotalTransactions()
      return { status: 'success', transactions }
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  } else if (args.action === 'filterTransactions') {
    try {
      const transactions = await filterTransactions(args.filterTerm)
      const payments = await getAllPayments(args.filterTerm)
      return JSON.parse(JSON.stringify({ status: 'success', transactions, payments }))
    } catch (error) {
      return JSON.parse(JSON.stringify({ status: 'error', message: error.message }))
    }
  } else if (args.action === 'addPayment') {
    try {
      const savedPayment = await savePayments(args.payment)
      return JSON.parse(
        JSON.stringify({
          status: 'success',
          payment: savedPayment
        })
      )
    } catch (error) {
      return JSON.parse(JSON.stringify({ status: 'error', message: error.message }))
    }
  } else if (args.action === 'getAllPayments') {
    try {
      const payments = await getAllPayments()
      return { status: 'success', payments }
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  } else if (args.action === 'uploadFiles') {
    try {
      const storeFiles = ['users', 'transactions', 'payments', 'totalTransactions']
      const uploadResults = []

      for (const storeFile of storeFiles) {
        const result = await uploadStoreFile(storeFile)
        uploadResults.push(result)
      }
      return {
        status: 'success',
        message: 'Backup completed',
        results: uploadResults
      }
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  }
})
