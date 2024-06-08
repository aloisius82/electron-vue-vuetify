const { contextBridge, ipcRenderer } = window
/**
* To make sure there is no other events are invoked
* and expose you app or computer to some problem (Attacks)!
*/
const validChannels = ["get-videos"];
contextBridge.exposeInMainWorld("ipc", {
  invoke: (channel, args) => {
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, args);
    }
  },
  on: (channel, func) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});
