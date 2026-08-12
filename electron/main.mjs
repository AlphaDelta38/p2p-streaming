import { app, BrowserWindow, protocol, net, session, desktopCapturer } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

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

  try {
    const envPath = join(__dirname, '../.env')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8')
      if (envContent.match(/environment\s*=\s*dev/i) || envContent.match(/enviromnet\s*=\s*dev/i)) {
        mainWindow.webContents.openDevTools()
      }
    }
  } catch (e) {
    console.error('Failed to read .env for devtools', e)
  }
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

  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
      callback({ video: sources[0] })
    }).catch((err) => {
      console.error('Error getting desktop sources:', err)
    })
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
