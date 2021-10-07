// Modules to control application life and create native browser window
const { app } = require('electron')
const path = require('path')
const { ipcMain } = require('electron')
const { dialog } = require('electron')
const { BrowserWindow } = require('electron')
const { Notification } = require('electron')

function createWindow () {
  // Create the browser window.
  const loadWindow = new BrowserWindow({
    width: 400,
    height: 400,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  loadWindow.loadFile('load_app.html')
  loadWindow.removeMenu()

  const mainWindow = new BrowserWindow({
    width: 320,
    height: 530,
    frame: true,
    show: false,
    resizable: false,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('run_rec.html')
  mainWindow.removeMenu()

  const nextcloudWindow = new BrowserWindow({
    width: 740,
    height: 510,
    frame: true,
    show: false,
    resizable: true,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  nextcloudWindow.loadURL('http://cloud.aymeric-mai.fr')
  nextcloudWindow.removeMenu()

  const stopWindow = new BrowserWindow({
    width: 320,
    height: 510,
    frame: true,
    show: false,
    resizable: false,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  stopWindow.loadFile('stop_rec.html')
  stopWindow.removeMenu()

  ipcMain.on('show-main', function (){
    mainWindow.show()
    mainWindow.reload()
  })

  ipcMain.on('show-stop', function (){
    stopWindow.show()
    stopWindow.reload()
  })

  ipcMain.on('show-load', function (){
    loadWindow.show()
    loadWindow.reload()
  })

  ipcMain.on('show-nextcloud', function (){
    nextcloudWindow.show()
    nextcloudWindow.reload()
  })

  ipcMain.on('hide-load', function (){
    loadWindow.hide()
  })

  ipcMain.on('hide-stop', function (){
    stopWindow.hide()
  })

  ipcMain.on('hide-main', function (){
    mainWindow.hide()
  })

  ipcMain.on('hide-nextcloud', function (){
    nextcloudWindow.hide()
  })

  nextcloudWindow.on('close', event=>{
    event.preventDefault(); //this prevents it from closing. The `closed` event will not fire now
    nextcloudWindow.hide();
  })

  ipcMain.on('notif-upload', function () {
    new Notification({ title: "Upload Forcé", body: "Les vidéos sont bien en cours d'upload !", icon: 'icon.png' }).show()
  })

  ipcMain.on('open-upload-dialog', function (event) {
    console.log('good')
    dialog.showMessageBox(null, {
      type: 'info',
          title: 'Information',
          message: "Vous allez forcer l'upload des vidéos sur nextcloud !" +
              '\n' +
              "L'upload est effectué de maniére automatique toute les nuits," +
              " ne forcer l'upload seulement en cas de nécessitée !" +
              '\n' +
              "Ceci peux prendre qulques minutes, êtes vous certain de vouloir continuer ?",
          buttons: ['Oui', 'Non'],
          defaultId: 0, // bound to buttons array
          cancelId: 1
    } ) .then(result => {
          if (result.response === 0) {
            // bound to buttons array
            console.log("Default button clicked OUI.");
            event.sender.send('information-dialog-selection', 'oui')
          } else if (result.response === 1) {
            // bound to buttons array
            console.log("Cancel button clicked NON.");
            event.sender.send('information-dialog-selection', 'non')
          }
          else {
            console.log()
          }
        }
    );
  });
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
