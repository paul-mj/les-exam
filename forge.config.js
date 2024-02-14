const path = require("path");

module.exports = {
    packagerConfig: {
        asar: true,
        icon: 'src/assets/images/icon'
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                // An URL to an ICO file to use as the application icon (displayed in Control Panel > Programs and Features).
                iconUrl: path.join(__dirname, 'src/assets/images/icon.ico'),
                // The ICO file to use as the icon for the generated Setup.exe
                setupIcon: path.join(__dirname, 'src/assets/images/icon.ico'),
            },
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
        {
            name: '@electron-forge/maker-deb',
            config: {
                options: {
                    icon: path.join(__dirname, 'src/assets/images/icon.png'),
                }
            },
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {
                icon: path.join(__dirname, 'src/assets/images/icon.ico'),
            },
        },
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-auto-unpack-natives',
            config: {},
        },
    ],
};