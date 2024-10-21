const { spawn } = require("child_process");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

/* a comment */

const Song = require("./mss.js").Song;
const Section = require("./mss.js").Section;
const Verse = require("./mss.js").Verse;

const Parser = require("./parser.js");

const { globalShortcut } = require("electron");

// self-explanatory
const globalWindowList = [];

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
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
app.on("browser-window-focus", function () {
  globalShortcut.register("CommandOrControl+R", () => {
    console.log("CommandOrControl+R is pressed: Shortcut Disabled");
  });
  globalShortcut.register("F5", () => {
    console.log("F5 is pressed: Shortcut Disabled");
  });
});
app.on("browser-window-blur", function () {
  globalShortcut.unregister("CommandOrControl+R");
  globalShortcut.unregister("F5");
});

/**
 * Creates a window for displaying lyrics / media
 * Returns nothing but pushes the window object to the globalWindowList
 *
 * @param windowNumber The number corresponding to the class in display.css for styling the window
 *
 */
const createDisplayWindow = (windowNumber) => {
  const thisWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  thisWindow.loadFile(path.join(__dirname, "display.html"));

  // adds the window to the global list of windows
  thisWindow.globalListIndex = globalWindowList.length;
  globalWindowList[thisWindow.globalListIndex] = thisWindow;

  // sends the window its number, setting up css styling
  thisWindow.once("ready-to-show", () => {
    thisWindow.webContents.send("ready-from-main", windowNumber);
  });

  thisWindow.on("close", () => {
    globalWindowList[thisWindow.globalListIndex] = null;
  });
};

/**
 * @fn Creating the window with the main gui
 * Returns nothing but pushes the window object to the globalWindowList
 */
const createMainWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 890,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "main.html"));
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

const createEditorWindow = () => {
  // Create the browser window.
  const editorWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 800,
    height: 700,
    minWidth: 800,
    minHeight: 700,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  editorWindow.loadFile(path.join(__dirname, "editor.html"));
  // adds the window to the global list of windows

  // adds the window to the global list of windows
  editorWindow.globalListIndex = globalWindowList.length;
  globalWindowList[editorWindow.globalListIndex] = editorWindow;

  // like a handshake between the main process and the window
  editorWindow.once("ready-to-show", () => {
    editorWindow.webContents.send("ready-from-main", "ready!!!!!!!");
  });
};

ipcMain.on("open-editor", (event, data) => {
  createEditorWindow();
});

// editor-related ipc events
ipcMain.on("song-string-to-main", (event, data) => {
  let lOptions = {
    title: "Save Song",
    buttonLabel: "Save",

    filters: [
      { name: "txt", extensions: ["txt"] },
      { name: "All Files", extensions: ["*"] },
    ],
  };

  dialog.showSaveDialog(null, lOptions).then(({ filePath }) => {
    fs.writeFileSync(filePath, data, "utf-8");
  });
});

ipcMain.on("editor-read-song-to-main", (event, data) => {
  // opens native file dialog
  dialog.showOpenDialog({ properties: ["openFile"] }).then(function (response) {
    // if the user finished loading a file
    if (!response.canceled) {
      console.log(response.filePaths[0]);

      readSong(response.filePaths[0], "read-song-to-editor");

      // does nothing if the user didnt select a file
    } else {
      console.log("no file selected");
    }
  });
});

/**
 * Console log 2
 * Sends data to main window's console
 * @param data Data to send
 */
function CL2(data) {
  globalWindowList[0].webContents.send("CL2", data);
}

// gets what text to display from the main window and sends it to every window
ipcMain.on("display-text-to-main", (event, data) => {
  sendToAllWindows("display-text-to-display", data);
});

ipcMain.on("clear-display", (event, data) => {
  sendToAllWindows("clear-display", data);
});

ipcMain.on("display-image-to-main", (event, data) => {
  sendToAllWindows("display-image-to-display", data);
});

ipcMain.on("logo-to-main", (event, data) => {
  sendToAllWindows("logo-to-display", data);
});

ipcMain.on("black-to-main", (event, data) => {
  sendToAllWindows("black-to-display", data);
});
// creates a window with a given window number
ipcMain.on("create-display-window", (event, data) => {
  createDisplayWindow(data);
});

/**
 * reads one song and sends ipc event to put it in the main window
 * @param path to song file
 */
function readSong(path, ipcCode) {
  // tries to parse the file
  const readOutput = Parser.readMSS(path);

  // if no error, sends it to the main window
  if (readOutput.error == "none") {
    CL2("Read song: " + readOutput.song.data.title);
    const stringifiedSong = JSON.stringify({
      song: readOutput.song,
      path: path,
    });
    sendToAllWindows(ipcCode, stringifiedSong);
    // if error, prints the error dialog
  } else {
    printError(readOutput.error);
    CL2(
      "Error reading song file " +
        path +
        ": " +
        "<BR>" +
        "&nbsp &nbsp &nbsp &nbsp &nbsp" +
        readOutput.error,
    );
  }
}

// opens a song file and sends it to the main window
ipcMain.on("read-song", (event, data) => {
  // opens native file dialog
  dialog.showOpenDialog({ properties: ["openFile"] }).then(function (response) {
    // if the user finished loading a file
    if (!response.canceled) {
      console.log(response.filePaths[0]);

      readSong(response.filePaths[0], "add-song-to-main");

      // does nothing if the user didnt select a file
    } else {
      console.log("no file selected");
    }
  });
});

/**
 * reads an image from a path
 * @param path
 */
function readImage(path) {
  globalWindowList[0].webContents.send("add-image-to-main", path);
  CL2("Opened image: " + path);
}

// opens an image and ends the address to the main display window
ipcMain.on("read-image", (event, data) => {
  // opens native file dialog
  dialog.showOpenDialog({ properties: ["openFile"] }).then(function (response) {
    // if the user finished loading a file
    if (!response.canceled) {
      console.log(response.filePaths[0]);

      readImage(response.filePaths[0]);
      // does nothing if the user didnt select a file
    } else {
      console.log("no file selected");
    }
  });
});

/**
 * @return the extension of a file from its path
 */
function getExtension(path) {
  return path.substring(path.lastIndexOf(".") + 1, path.length) || path;
}

// reads a whole directory and tries to
// parse .mss and .txt files, and adds
// files with image terminations
ipcMain.on("read-dir", (event, data) => {
  skippedFilsList = [];

  dialog
    .showOpenDialog({ properties: ["openDirectory"] })
    .then(function (response) {
      if (!response.canceled) {
        CL2("Reading folder: " + response.filePaths[0]);
        let filenames = fs.readdirSync(response.filePaths[0]);
        for (let filename of filenames) {
          let path = response.filePaths[0] + "\\" + filename;
          let ext = getExtension(path);
          console.log("reading from dir: ", path, " ", ext);

          if (ext == "txt" || ext == "mss") {
            readSong(path, "add-song-to-main");
          } else if (
            ext == "jpeg" ||
            ext == "jpg" ||
            ext == "gif" ||
            ext == "png"
          ) {
            readImage(path);
          } else {
            skippedFilsList.push(filename);
          }
        }

        CL2("Skipped Files:");
        if (skippedFilsList) {
          for (let fln of skippedFilsList) {
            CL2(fln);
          }
        }
        CL2("&nbsp");
        // does nothing if the user didnt select a file
      } else {
        console.log("no file selected");
      }
    });
});

/**
 * Spawns a child that runs cp inputPath outputPath command
 */
function spawnCP(inputPath, outputPath) {
  console.log("copying ", inputPath, "   ", outputPath);
  // FIXME: copy is a windows command.
  // const child = execute("copy" + " " + "\"" + inputPath + "\"" + " " + "\"" + outputPath + "\"");
  const child = spawn("copy", [`"${inputPath}"`, `"${outputPath}"`], {
    shell: true,
  });
  // child.on('exit', function (code, signal) {
  //   console.log(`child process (cp ${inputPath} ${outputPath} exited with ` + `code ${code} and signal ${signal}`);
  // });

  child.on("error", (err) => console.log(err));
  child.stdout.on("data", (data) => {
    //Here is the output
    data = data.toString();
    console.log(data);
  });

  // console.log("env!!!!!! ", process.env.PATH );
}

/**
 * @return the correct amount of 0s to make a < 1000 number 3 digits (001) (024) (982)
 */
function get0s(num) {
  return num >= 100 ? "" : num >= 10 ? "0" : "00";
}

ipcMain.on("save-dir", (event, data) => {
  // we're gonna send all paths to main.js via ipc so they can be stored inside song/image objects.
  // the we're gonna recieve that list, in order, and run mv command while adding ###!-H prefix to the files.
  pathArray = JSON.parse(data);

  dialog
    .showOpenDialog({ properties: ["openDirectory"] })
    .then(function (response) {
      if (!response.canceled) {
        let outputPath = response.filePaths[0];
        let i = 1;

        for (let path of pathArray) {
          if (i < 1000) {
            let filename = path;

            if (filename.includes("\\")) {
              filename = filename.substring(filename.lastIndexOf("\\") + 1);
            }

            if (filename.includes("/")) {
              filename = filename.substring(filename.lastIndexOf("/") + 1);
            }

            // hides anything before the !-H command
            if (filename.includes("!-H")) {
              filename = filename
                .substring(filename.lastIndexOf("!-H") + 3)
                .trim();
            }

            // if (filename.includes(":")) {
            //   filename = filename.substring(filename.lastIndexOf(':')+1);
            // }
            spawnCP(
              path,
              outputPath + "\\" + get0s(i) + i.toString() + "!-H" + filename,
            );
          }
          i++;
        }

        // does nothing if the user didnt select a file
      } else {
        console.log("no file selected");
      }
    });
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
//
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
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

// WARN: i dont understand what this means.
app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
//
