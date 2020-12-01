'use strict'

const {ipcRenderer} = require('electron')
const {TeamCollection} = require('../my_modules/Classes')

let _event

let _setupmap = document.getElementById('setup-teams')
let _selectmap = document.getElementById('select-map')
let _mapimage = document.getElementById('map-image')
let _setupteams = document.getElementById('setup-teams')
let _teamsamount = document.getElementById('teams-amount')
let _teamslist = document.getElementById('teams-list')
let _setupsubmit = document.getElementById('setup-submit')
let _problemsamount = document.getElementById('problems-amount')

let _teams = new TeamCollection()
let _maps = []

refreshProblems()
_problemsamount.oninput = refreshProblems

function refreshProblems(){
    let problems = []
    for (let i = 1; i <= _problemsamount.value; i++){
        problems.push(i)
    }
    _teams.setProblems(problems)
}

_teamsamount.oninput = function(){
    recalculateTeams()
    refreshTeamsList()
    refreshProblems()
}

_setupsubmit.onclick = function(event){
    event.preventDefault()
    ipcRenderer.send('setupFinished', {teams: _teams, map: _selectmap.value})
    window.close()
}

let listHtmlClass = {
    li: "list__entry",
    name: 'entry__name',
    color: 'entry__color'
}

let colors = [
    '#00ff00', '#ff0000', '#0000ff',
    '#ffaaaa', '#aaffaa', '#aaaaff',
    '#00ddff', '#dd00ff', '#ddffdd',
    '#eeff00', '#cc9900', '#aa5500',
    '#00eeaa', '#00aa77', '#008822'
]

function recalculateTeams(){
    let amount = _teamsamount.value

    if (amount <= _teams.teams.length) {
        _teams.teams = _teams.teams.slice(0, amount)
    }else{
        for (let i = _teams.teams.length; i < amount; i++){
            let id = _teams.addTeam(`незнашки-${i}`)
            _teams.getTeamByID(id).color = colors[id]
        }
    }
}

function refreshTeamsList(){
    _teamslist.innerHTML = ""
    _teams.teams.forEach((elem) => {
        let li = document.createElement('li')
        li.classList.add(listHtmlClass.li)

        let name = document.createElement('input')
        name.classList.add(listHtmlClass.name)
        name.value = elem.name

        let color = document.createElement('input')
        color.type = "color"
        color.classList.add(listHtmlClass.color)
        color.value = elem.color

        li.appendChild(name)
        li.appendChild(color)

        _teamslist.appendChild(li)

        name.oninput = function(){
            elem.name = name.value
        }

        color.oninput = function(){
            elem.color = color.value
        }
    })
}

function refreshMapList(){
    _selectmap.innerHTML = ""
    _maps.forEach((elem, index) => {
        let option = document.createElement('option')
        let arr = elem.split('\\')
        let map = arr.slice(Math.max(arr.length - 3, 1)).join('/')
        option.value = elem
        option.innerHTML = map

        _selectmap.appendChild(option)
    })
}

ipcRenderer.on('setMaps', (event, arg) => {
    _maps = arg
    refreshMapList()
    _event = event
})