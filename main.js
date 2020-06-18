const { app, BrowserWindow, Menu } = require("electron");
const fetch = require('node-fetch');

let mainWindow;
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 740,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            allowEval: false,
            enableRemoteModule: true
        }
    })
    mainWindow.loadFile("src/index.html");

    const menu = Menu.buildFromTemplate([
        {
            label: "App",
            submenu: [
                { role: "quit" }
            ]
        },
        {
            label: "About",
            click() {
                openAboutWindow();
            }
        }
    ])
    mainWindow.setMenu(menu)
}

let loadingScreen;
function startLoading() {
    loadingScreen = new BrowserWindow({
        width: 300,
        height: 500,
        frame: false
    })
    loadingScreen.setResizable(false);
    loadingScreen.loadFile("src/loadingScreen.html");
    loadingScreen.on("closed", () => {
        loadingScreen = null;
    })
    loadingScreen.webContents.on("did-finish-load", () => {
        loadingScreen.show();
    })

    fetch('https://api.github.com/repos/revoxhere/duino-coin/releases/latest')
    .then(response => {
        response.json()
        .then(val => {
            global.release = val
        }).then(() => {
            setTimeout(() => {
                loadingScreen.close();
                mainWindow.show();
            }, 5000)
        })
    })
}

let aboutWindow;
function openAboutWindow() {
    aboutWindow = new BrowserWindow({
        width: 450,
        height: 130
    })
    aboutWindow.loadFile("src/aboutWindow.html");
    aboutWindow.on("closed", () => {
        aboutWindow = null;
    })
    aboutWindow.webContents.on("did-finish-load", () => {
        aboutWindow.show();
    })
    aboutWindow.setMenu(null)
}

app.on("ready", () => {
    createWindow();
    startLoading();
})

app.on("all-window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
})