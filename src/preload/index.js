import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  isOnline: () => navigator.onLine,
  onNetworkStatusChange: (callback) => {
    window.addEventListener('online', () => callback(true))
    window.addEventListener('offline', () => callback(false))
    callback(navigator.onLine)
  },
  sendNotification: (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body })
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, { body })
        }
      })
    }
  },
  sendTimeBasedNotification: (hour, minute, title, body) => {
    const targetTime = new Date()
    targetTime.setHours(hour)
    targetTime.setMinutes(minute)
    targetTime.setSeconds(0)
    targetTime.setMilliseconds(0)
    const timeDifference = targetTime.getTime() - new Date().getTime()
    if (timeDifference > 0) {
      setTimeout(() => {
        api.sendNotification(title, body)
      }, timeDifference)
    }
  }
}
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
