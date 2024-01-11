const Parser = require("./parser.js");

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mainAPI', {
  onReadyFromMain: (callback) => ipcRenderer.on('ready-from-main', (_event, value) => callback(value)),
  onSongTest: (callback) => ipcRenderer.on('song-test', (_event, value) => callback(value)), 
  sendDisplayText: (data) => ipcRenderer.send("display-text-to-main", data),
  sendReadSong: () => ipcRenderer.send("read-song", "a message"),
  sendCreateWindow: (data) => ipcRenderer.send("create-display-window", data),
  onSongAdded: (callback) => ipcRenderer.on("add-song-to-main", (_event, value) => callback(value)),

  }
)

contextBridge.exposeInMainWorld("displayAPI", {
  onReadyFromMain: (callback) => ipcRenderer.on('ready-from-main', (_event, value) => callback(value)),
  onGetDisplayText: (callback) => ipcRenderer.on("display-text-to-display", (_event, value) => callback(value)),
})

contextBridge.exposeInMainWorld("Parser", {
  debugPrintSong: (songObject) => Parser.debugPrintSong(songObject)
})
