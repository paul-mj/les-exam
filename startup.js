const { app, globalShortcut, shell } = require('electron')

function fetchFingerdetails() {
    console.log("Fetching finger details");
}

function initialise(mainWindow) {
    // Register a shortcut listener.
    globalShortcut.register('Shift+Alt+6', () => {
        app.quit();
    })

    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.code === 'F4' && input.alt) {
            //input.key.toLowerCase() === 'f4'
            event.cancelBubble = true;
            event.returnValue = false;
            event.preventDefault();
        }
    })

    mainWindow.onload = () => {
        // Attach the listener to the whole document.
        document.addEventListener("auxclick", handleNonLeftClick);
    }
    //hookWindow();
}

function dispose() {
    // Unregister a shortcut.
    globalShortcut.unregister('Shift+Alt+6');
    // Unregister all shortcuts.
    globalShortcut.unregisterAll();
}

function handleNonLeftClick(e) {
    // e.button will be 1 for the middle mouse button.
    if (e.button === 1) {
        // Check if it is a link (a) element; if so, prevent the execution.
        if (e.target.tagName.toLowerCase() === "a") {
            // Prevent the default action to fire...
            e.preventDefault();
            // ...and let the OS handle the URL.
            shell.openExternal(e.target.href);
        }
    }
}

module.exports = { initialise, dispose };

