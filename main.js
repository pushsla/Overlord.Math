'use strict'

require('./my')
const {app, ipcMain} = require('electron')
const {handleSquirrelEvent} = require('./my_modules/squirrel')
if (handleSquirrelEvent(app)) {
// squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
} else {
    const {Window, dialog} = my_require('Window')
    const {Map, Team, Polygon, Label, TeamCollection, Request} = require('./my_modules/Classes')
    const fs = require('fs')
    const path = require('path')

    const isDev = false
    const PATH = app ? app.getAppPath() : remote.app.getAppPath()

    const _maps = [
        path.resolve(PATH, './assets/maps/plagueinc/map.json')
    ]

    let _teams
    let _map

    let mainWindow
    let setupWindow
    let statisticsWindow

    let mapHistory = []
    let teamHistory = []

    function main() {
        mainWindow = new Window({
            file: path.resolve(PATH, 'renderer/index.html'),
            autoHideMenuBar: true,
            icon: path.resolve(PATH, 'icon.png')
        }, isDev)
        mainWindow.maximize()

        setupWindow = new Window({
            file: path.resolve(PATH, 'renderer/setup.html'),
            parent: mainWindow,
            modal: true,
            frame: false
        }, isDev)
        setupWindow.webContents.on('did-finish-load', () => {
            setupWindow.webContents.send('setMaps', _maps)
        })
    }

    function load(teams = new TeamCollection(), file = path.resolve(PATH, './assets/maps/plagueinc/map.json')) {
        let json = JSON.parse(fs.readFileSync(file, 'utf-8'))
        _map = new Map(json)
        _teams = teams
    }

    function archieveGame(jsonmap, jsonteams) {
        teamHistory.push(jsonteams)
        mapHistory.push(jsonmap)
    }

    function rememberGame() {
        if (mapHistory.length === 1 || teamHistory.length === 1) {
            return [mapHistory[0], teamHistory[0]]
        } else {
            return [mapHistory.pop(), teamHistory.pop()]
        }
    }

    function exit() {
        app.quit()
    }

    ipcMain.on('showStatistics', (event, teams) => {
        statisticsWindow = new Window({
            file: path.resolve(PATH, 'renderer/statistics.html'),
            parent: mainWindow,
            modal: true,
            autoHideMenuBar: true,
            icon: path.resolve(PATH, 'icon.png')
        }, isDev)
        statisticsWindow.webContents.on('did-finish-load', () => {
            statisticsWindow.send('setStatistics', teams)
        })
    })
    ipcMain.on('archieveGame', (event, map, teams) => archieveGame(map, teams))
    ipcMain.on('rememberGame', (event) => {
        event.returnValue = rememberGame()
    })
    ipcMain.on('setupFinished', (event, arg) => {
        console.log(arg.teams)
        console.log(arg.map)
        load(arg.teams, arg.map)
        mainWindow.webContents.send('setMap', _map)
        mainWindow.webContents.send('setTeams', _teams)
        mainWindow.webContents.send('startGame')
    })

    app.on('ready', main)
    app.on('window-all-closed', exit)
}
