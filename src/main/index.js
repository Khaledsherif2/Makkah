import { app, shell, BrowserWindow, Menu, Tray } from 'electron'
const windowState = require('electron-window-state')
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/logo.ico?asset'
import '../../src/services/ipcMain'

let mainWindow, trayMenu, tray
trayMenu = Menu.buildFromTemplate([{ role: 'quit' }])
let contextMenu = Menu.buildFromTemplate([
  { role: 'editMenu' },
  { role: 'reload' },
  { role: 'toggleDevTools' },
  { role: 'quit' }
])

let mainMenu = Menu.buildFromTemplate([
  {
    label: 'File',
    submenu: [{ label: 'close', role: 'quit' }]
  }
])

function createTray() {
  tray = new Tray(icon)
  tray.on('error', (error) => {
    console.error('Tray error:', error)
  })
  tray.setToolTip('Makka')
  tray.setContextMenu(trayMenu)
}

function createWindow() {
  createTray()
  Menu.setApplicationMenu(mainMenu)

  let winState = windowState({
    defaultWidth: 500,
    defaultHeight: 500
  })

  mainWindow = new BrowserWindow({
    minWidth: 900,
    minHeight: 600,
    width: winState.width,
    height: winState.height,
    x: winState.x,
    y: winState.y,
    show: false,
    icon: icon,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.webContents.on('context-menu', () => {
    contextMenu.popup()
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  winState.manage(mainWindow)
  mainWindow.once('ready-to-show', mainWindow.show)

  mainWindow.on('close', () => {
    mainWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'home' })
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
