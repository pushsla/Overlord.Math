'use strict'

const {ipcRenderer} = require('electron')
const {TeamCollection} = require('../my_modules/Classes')

const _statistics = document.getElementById('main-statistics')

function getObjMessage(Proto, data) {
    let dest = new Proto({})
    for (let key in data) {
        if (dest.hasOwnProperty(key)) {
            dest[key] = data[key]
        }
    }
    return dest
}

ipcRenderer.on('setStatistics', (event, team) => {
    let obj = getObjMessage(TeamCollection, team)
    _statistics.appendChild(obj.problemsToDOM())
})