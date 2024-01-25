const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');


const Song = require("./mss.js").Song;
const Section = require("./mss.js").Section;
const Verse = require("./mss.js").Verse;

const Parser = require("./parser.js");


const { globalShortcut } = require('electron');

// self-explanatory
const globalWindowList = [];

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Will add external folder later
//console.log(__dirname + '/../extraResources/');

/** Prints an error dialogue box
  * In the near future should print full messages, not just the codes.
  * @param the error code
  */
function printError(code) {
  dialog.showErrorBox("Error Reading File", code);
}


/* Removes user access to shortcuts for refresing the page */
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





/**
  * Creates a window for displaying lyrics / media
  * Returns nothing but pushes the window object to the globalWindowList
  *
  * @param windowNumber The number corresponding to the class in display.css for styling the window
  *
  */
const createDisplayWindow = (windowNumber) => {

  const thisWindow = new BrowserWindow( {
    autoHideMenuBar: true,
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  });

  thisWindow.loadFile(path.join(__dirname, 'display.html'));

  // adds the window to the global list of windows
  thisWindow.globalListIndex = globalWindowList.length;
  globalWindowList[thisWindow.globalListIndex] = thisWindow;

  // sends the window its number, setting up css styling
  thisWindow.once("ready-to-show", () => {
    thisWindow.webContents.send("ready-from-main", windowNumber);
  });

  thisWindow.on("close", () => {
    globalWindowList[thisWindow.globalListIndex] = null;
  })
  
}


/**
  * Creating the window with the main gui
  * Returns nothing but pushes the window object to the globalWindowList
  */
const createMainWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'main.html'));
  // adds the window to the global list of windows

  globalWindowList.push(mainWindow);

  // like a handshake between the main process and the window
  mainWindow.once("ready-to-show", () => {
    mainWindow.webContents.send("ready-from-main", "ready!!!!!!!");
  });

};


// sends data to all windows on channel
function sendToAllWindows(channel, data) {
  for (let w of globalWindowList) {
    if (w) {
      w.webContents.send(channel, data);
    }
  }
}


// gets what text to display from the main window and sends it to every window
ipcMain.on("display-text-to-main", (event, data) => {
  sendToAllWindows("display-text-to-display", data);
});


ipcMain.on("display-image-to-main", (event, data) => {
  sendToAllWindows("display-image-to-display", data);
})

ipcMain.on("logo-to-main", (event, data) => {
  sendToAllWindows("logo-to-display", data);
})

ipcMain.on("black-to-main", (event, data) => {
  sendToAllWindows("black-to-display", data)
})
// creates a window with a given window number
ipcMain.on("create-display-window", (event, data) => {
  createDisplayWindow(data);
});


// opens a song file and sends it to the main window
ipcMain.on("read-song", (event, data) => {

  // opens native file dialog
  dialog.showOpenDialog({properties: ['openFile'] }).then(function (response) {
    // if the user finished loading a file
    if (!response.canceled) {

      console.log(response.filePaths[0]);

      // tries to parse the file
      const readOutput = Parser.readMSS(response.filePaths[0]);

      // if no error, sends it to the main window
      if (readOutput.error == "none") {

        const stringifiedSong = JSON.stringify(readOutput.song);
        globalWindowList[0].webContents.send("add-song-to-main", stringifiedSong);

      // if error, prints the error dialog
      } else {

        printError(readOutput.error);

      }

    // does nothing if the user didnt select a file
    } else {

      console.log("no file selected");

    }
  });
})


// opens an image and ends the address to the main display window
ipcMain.on("read-image", (event, data) => {

  // opens native file dialog
  dialog.showOpenDialog({properties: ['openFile'] }).then(function (response) {
    // if the user finished loading a file
    if (!response.canceled) {

      console.log(response.filePaths[0]);


      globalWindowList[0].webContents.send("add-image-to-main", response.filePaths[0]);

    // does nothing if the user didnt select a file
    } else {

      console.log("no file selected");

    }
  });
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// 
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createMainWindow();

  console.log(BrowserWindow.getAllWindows());


});



// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
//
// I dont think this makes sense here
/*
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
*/

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
//
