'use strict'

const {ipcRenderer} = require('electron')
const {Map, TeamCollection, mapHtmlClass} = require('../my_modules/Classes')
const {Request} = require('../my_modules/UX')
const $ = require('jquery')

let _map;
let _teams;
let _request;

let _gamestats = document.getElementById('game-stats')
let _gamerequest = document.getElementById('game-request')
let _gamemap = document.getElementById('game-map')
let _gamestatistics = document.getElementById('game-statistics')

_gamestatistics.onclick = function(event){
    event.preventDefault()
    ipcRenderer.send('showStatistics', _teams)
}

let control_back = document.getElementById('control-revert')

function refreshGame(archieve = true) {
    refreshMap()
    recolorMap()
    refreshStats()
    refreshRequests()
}

function epicBattle(result) {
    let team_id = result.team_id
    let conditions = result.conditions
    let polygon_name = result.polygon_name
    let action = result.action

    if (action != "" && team_id != "") {
        let team = _teams.getTeamByID(team_id)
        ipcRenderer.send('archieveGame', _map, _teams)

        if (conditions[0].length >= conditions[1]) {
            conditions[0].forEach((elem) => {
                team.solved[elem-1] = 1
            })
            switch (action) {
                case "power":
                    if (team.power < 10) {
                        team.power++
                        alert(`Команда ${team.name} обрела одно очко силы!`)
                    } else {
                        alert(`Команда ${team.name} итак слишком сильна!`)
                    }
                    break;
                default:
                    let poly = _map.getPolygon(polygon_name)
                    let owner_id = poly.team

                    if (owner_id == -1) {
                        team.regions++
                        _map.ownPolygon(polygon_name, team_id)
                    } else {
                        let owner = _teams.getTeamByID(owner_id)
                        if (team.power >= owner.power) {
                            team.regions++
                            owner.regions--
                            _map.ownPolygon(polygon_name, team_id)
                            alert(`Команда ${team.name} захватила ${polygon_name} регион!`)
                        } else {
                            alert("Нельзя атаковать более сильного противника! ")
                        }
                    }
                    break;
            }
        } else {
            team.power--
            alert(`Команда ${team.name} потеряла одно очко силы!`)
        }
        refreshGame()
    }
}

function recolorMap() {
    let polygons = $(`.${mapHtmlClass.polygon}`)

    for (let i = 0; i < polygons.length; i++) {
        let elem = polygons[i]
        let team_id = elem.getAttribute('data-team')
        if (team_id != -1) {
            let team = _teams.getTeamByID(team_id)
            elem.style.fill = team.color
            elem.classList.add(mapHtmlClass.polygon_owned)
        }
    }
}

function refreshMap(div = _gamemap) {
    div.innerHTML = ""
    div.appendChild(_map.toDOM())
}

function refreshStats(div = _gamestats) {
    div.innerHTML = ""
    div.appendChild(_teams.toDOM())
}

function refreshRequests(div = _gamerequest) {
    div.innerHTML = ""
    _request = new Request(_teams, _map)
    div.appendChild(_request.toDOM())

    _request.button.onclick = function (event) {
        event.preventDefault()
        epicBattle(_request.result)
    }
}

function getObjMessage(Proto, data) {
    let dest = new Proto({})
    for (let key in data) {
        if (dest.hasOwnProperty(key)) {
            dest[key] = data[key]
        }
    }
    return dest
}

control_back.onclick = function (event) {
    event.preventDefault()
    let game = ipcRenderer.sendSync('rememberGame')
    console.log(game)
    let mapjson = game[0]
    let teamsjson = game[1]
    _map = getObjMessage(Map, mapjson)
    _teams = getObjMessage(TeamCollection, teamsjson)
    refreshGame(false)
}

ipcRenderer.once('startGame', () => {
    ipcRenderer.send('archieveGame', _map, _teams)
    refreshGame()
})
ipcRenderer.on('setTeams', (event, arg) => {
    _teams = new TeamCollection()
    for (let key in arg) {
        if (_teams.hasOwnProperty(key)) {
            _teams[key] = arg[key]
        }
    }
})
ipcRenderer.on('setMap', (event, arg) => {
    _map = getObjMessage(Map, arg)
})
