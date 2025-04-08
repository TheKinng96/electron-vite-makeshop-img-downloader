import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { DownloadParams, DownloadProgress, DownloadStatus, SingleImageParams } from '../renderer/src/types';

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', {
      checkImages: (params: DownloadParams) =>
        ipcRenderer.invoke('check-images', params),
      createDomainFolder: (params: { storagePath: string; domainName: string }) =>
        ipcRenderer.invoke('create-domain-folder', params),
      downloadSingleImage: (params: SingleImageParams) =>
        ipcRenderer.invoke('download-single-image', params),
      getDefaultFolder: () => ipcRenderer.invoke('get-default-folder'),
      selectFolder: () => ipcRenderer.invoke('select-storage-path'),

      onDownloadProgress: (callback: (event: any, data: DownloadProgress) => void) =>
        ipcRenderer.on('download-progress', callback),
      onDownloadComplete: (callback: (event: any, status: DownloadStatus) => void) =>
        ipcRenderer.on('download-complete', callback),
      cancelDownload: () => ipcRenderer.send('cancel-download'),
    });
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
