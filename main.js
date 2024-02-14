const { app, BrowserWindow, globalShortcut } = require('electron')
const url = require("url");
const path = require("path");

const startup = require(path.join(__dirname, 'startup.js'));

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        icon: path.join(__dirname, 'src/assets/images/icon.png'),
        fullscreen: true,
        resizable: false,
        frame: true,
        autoHideMenuBar: true,
        kiosk: true,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
        },
    })

    mainWindow.loadURL(path.join(__dirname, 'dist', 'exam', 'browser', 'index.html'));
    /* 
        mainWindow.webContents.openDevTools() 
        mainWindow.setMenu(null);
    */
    mainWindow.removeMenu();

    mainWindow.on('closed', function () {
        mainWindow = null
    })

    mainWindow.on('close', function (e) {
        //UnhookWindowsHookEx(hHook);
        //e.preventDefault()
    })

    globalShortcut.register('Alt+F4', () => { });
    globalShortcut.register('CommandOrControl+Esc', () => { });
 
    mainWindow.onbeforeunload = (e) => {
        // Unlike usual browsers that a message box will be prompted to users, returning
        // a non-void value will silently cancel the close.
        // It is recommended to use the dialog API to let the user confirm closing the
        // application.
        e.returnValue = false
    }
}


let isInstanceRunning = app.requestSingleInstanceLock()
if (!isInstanceRunning) {
    app.quit()
}
// Behaviour on second instance for parent process- Pretty much optional
app.on('second-instance', (event, argv, cwd) => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore()
        }
        mainWindow.focus()
    }
})

app.on('ready', () => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.whenReady().then(() => {
    startup.initialise(mainWindow);
})

app.on('will-quit', () => {
    startup.dispose();
    globalShortcut.unregisterAll();
})
