if (require('electron-squirrel-startup')) return;
const { app, BrowserWindow, globalShortcut } = require('electron');

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

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
            webSecurity: false,
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

  
function handleSquirrelEvent() {
    if (process.argv.length === 1) {
      return false;
    }
  
    const ChildProcess = require('child_process');
    const path = require('path');
  
    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);
  
    const spawn = function(command, args) {
      let spawnedProcess, error;
  
      try {
        spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
      } catch (error) {}
  
      return spawnedProcess;
    };
  
    const spawnUpdate = function(args) {
      return spawn(updateDotExe, args);
    };
  
    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
      case '--squirrel-install':
      case '--squirrel-updated':
        // Optionally do things such as:
        // - Add your .exe to the PATH
        // - Write to the registry for things like file associations and
        //   explorer context menus
  
        // Install desktop and start menu shortcuts
        spawnUpdate(['--createShortcut', exeName]);
  
        setTimeout(app.quit, 1000);
        return true;
  
      case '--squirrel-uninstall':
        // Undo anything you did in the --squirrel-install and
        // --squirrel-updated handlers
  
        // Remove desktop and start menu shortcuts
        spawnUpdate(['--removeShortcut', exeName]);
  
        setTimeout(app.quit, 1000);
        return true;
  
      case '--squirrel-obsolete':
        // This is called on the outgoing version of your app before
        // we update to the new version - it's the opposite of
        // --squirrel-updated
  
        app.quit();
        return true;
    }
  };