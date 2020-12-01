'use strict'

const {BrowserWindow} = require('electron')

const defaultProps = {
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
        nodeIntegration: true
    }
}

class Window extends BrowserWindow{
    constructor({file, ...windowSettings}, devtools=false) {
        super({...defaultProps, ...windowSettings});

        this.loadFile(file)
        if (devtools) this.webContents.openDevTools()
        this.once('ready-to-show', () => {
            this.show()
        })
    }
}

module.exports = {defaultProps, Window}