/*!-----------------------------------------------------------------------------
 * 動物病院　カルテシステム　Lucky 
 * v1.0.0 - built 2021-01-30
 * Licensed under the MIT License.
 * Copyright (c) 2021 Yuta Hosoi https://meknowledge.jpn.org/
 * See LICENSE.md and README.md
* --------------------------------------------------------------------------*/

// ipcRendererの機能をrendererにも与える
const { contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld(
  "preloaded", {
    send: (channel, data) => {//rendererからの送信用//
        ipcRenderer.send(channel, data);            
      },
    on: (channel, func) => { //rendererでの受信用, funcはコールバック関数//
        ipcRenderer.on(channel, (event, arg) => func(event, arg));
    }
  }
);
