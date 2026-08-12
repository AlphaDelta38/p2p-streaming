import { app, BrowserWindow, protocol, net } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
])

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  })

  mainWindow.loadURL('app://localhost/')
}

app.whenReady().then(() => {
  protocol.handle('app', (request) => {
    const url = new URL(request.url)
    
    const normalizedPath = url.pathname.replace(/^\/+/, '')
    let targetPath = join(__dirname, '../.output/public', normalizedPath)

    try {
      if (!fs.existsSync(targetPath) || fs.statSync(targetPath).isDirectory()) {
        targetPath = join(__dirname, '../.output/public/index.html')
      }
    } catch (e) {
      targetPath = join(__dirname, '../.output/public/index.html')
    }

    return net.fetch(`file://${targetPath}`)
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
