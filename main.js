const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require("path");

const startup = require(path.join(__dirname, 'startup.js'));

let mainWindow;

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
            webSecurity: false
        },
    });

    mainWindow.loadURL(path.join(__dirname, 'dist', 'exam', 'browser', 'index.html'));
    mainWindow.removeMenu();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    mainWindow.on('close', function (e) {
        // Handle close event if needed
    });

    mainWindow.webContents.on('did-finish-load', () => {
        // Once the main window finishes loading, hide the loader if present
        mainWindow.webContents.executeJavaScript('hideLoader();'); // Assuming you have a function named hideLoader in your index.html
    });

    globalShortcut.register('Alt+F4', () => { });
    globalShortcut.register('CommandOrControl+Esc', () => { });

    mainWindow.onbeforeunload = (e) => {
        e.returnValue = false;
    };
}

// Ensure single instance
const isInstanceRunning = app.requestSingleInstanceLock();
if (!isInstanceRunning) {
    app.quit();
}

app.on('second-instance', (event, argv, cwd) => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
        mainWindow.focus();
    }
});

app.on('ready', () => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (!mainWindow) {
        createWindow();
    }
});

app.whenReady().then(() => {
    startup.initialise(mainWindow);
});

app.on('will-quit', () => {
    startup.dispose();
    globalShortcut.unregisterAll();
});
