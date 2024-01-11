const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');


const Song = require("./mss.js").Song;
const Section = require("./mss.js").Section;
const Verse = require("./mss.js").Verse;

const Parser = require("./parser.js");



const { globalShortcut } = require('electron');
app.on('browser-window-focus', function () {
    globalShortcut.register("CommandOrControl+R", () => {
        console.log("CommandOrControl+R is pressed: Shortcut Disabled");
    });
    globalShortcut.register("F5", () => {
        console.log("F5 is pressed: Shortcut Disabled");
    });
});
app.on('browser-window-blur', function () {
    globalShortcut.unregister('CommandOrControl+R');
    globalShortcut.unregister('F5');
});



// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createDisplayWindow = (windowNumber) => {

  const thisWindow = new BrowserWindow( {
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  });

  thisWindow.loadFile(path.join(__dirname, 'display.html'));

  globalWindowList.push(thisWindow);

  thisWindow.once("ready-to-show", () => {
    thisWindow.webContents.send("ready-from-main", windowNumber);
  });
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.webContents.send("ready-from-main", "ready!!!!!!!");

    exampleJSON = JSON.stringify(Parser.readMSS("./example-file.mss").song);
    mainWindow.webContents.send("song-test", exampleJSON);
    console.log(exampleJSON);
  })
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'main.html'));

  mainWindow.webContents.openDevTools();
  // Open the DevTools.

  return mainWindow; 
};


ipcMain.on("display-text-to-main", (event, data) => {
  console.log(data);
  for (let win of globalWindowList) {
    win.webContents.send("display-text-to-display", data);
  }
});

ipcMain.on("create-display-window", (event, data) => {
  createDisplayWindow(data);
});

const globalWindowList = [];
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// 
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  win = createWindow();
  globalWindowList.push(win);
  console.log(BrowserWindow.getAllWindows());
  createDisplayWindow(1);
  createDisplayWindow(2);


}
);



// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
//
