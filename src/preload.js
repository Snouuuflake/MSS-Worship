const Parser = require("./parser.js");

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mainAPI', {
  onReadyFromMain: (callback) => ipcRenderer.on('ready-from-main', (_event, value) => callback(value)),
  onSongTest: (callback) => ipcRenderer.on('song-test', (_event, value) => callback(value)), 
  onSongAdded: (callback) => ipcRenderer.on("add-song-to-main", (_event, value) => callback(value)),
  onImageAdded: (callback) => ipcRenderer.on("add-image-to-main", (_event,value) => callback(value)),

  sendReadSong: () => ipcRenderer.send("read-song", "a message"),
  sendReadImage: () => ipcRenderer.send("read-image", "a message"),
  sendReadDir: () => ipcRenderer.send("read-dir", "a message"),
  sendSaveDir: (data) => ipcRenderer.send("save-dir", data),

  sendDisplayText: (data) => ipcRenderer.send("display-text-to-main", data),
  sendDisplayImage: (data) => ipcRenderer.send("display-image-to-main", data),
  sendCreateWindow: (data) => ipcRenderer.send("create-display-window", data),
  sendToLogo: (data) => ipcRenderer.send("logo-to-main", data),
  sendToBlack: (data) => ipcRenderer.send("black-to-main", data),
  }
)

contextBridge.exposeInMainWorld("displayAPI", {
  onReadyFromMain: (callback) => ipcRenderer.on('ready-from-main', (_event, value) => callback(value)),
  onGetDisplayText: (callback) => ipcRenderer.on("display-text-to-display", (_event, value) => callback(value)),
  onGetDisplayImage:  (callback) => ipcRenderer.on("display-image-to-display", (_event, value) => callback(value)),
  onGetLogo: (callback) => ipcRenderer.on("logo-to-display", (_event, value) => callback(value)),
  onGetBlack: (callback) => ipcRenderer.on("black-to-display", (_event, value) => callback(value)),

})

contextBridge.exposeInMainWorld("Parser", {
  debugPrintSong: (songObject) => Parser.debugPrintSong(songObject)
})
