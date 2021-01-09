'use strict'

/*
Team: {
    name: "str",
    color: "str"
}
 */
function Team(id) {
    this.id = id
    this.name = undefined
    this.color = undefined
    this.power = 10
    this.regions = 0
    this.problems = []
    this.solved = []
}

/*
TeamCollection: {
    teams: [Team, Team]
}

TeamCollection DOM representation:
.teams
    table.teams__teamtable
        tr.teamtable__head>th{team}+th{color}+th{power}+th{regions}
        tr.teamtable__row>td{TEAM->name}+td{TEAM->color}+td{TEAN->power}+td{TEAM->regions}*AMOUNT
 */
let teamsHtmlClass = {
    div: "teams",
    table: "teams__teamtable",
    tr: "teamtable__row",
    th: "teamtable_th",
    td: "teamtable_td"
}

let teamKeyTranslations = {
    'id': '№',
    'name': 'Команда',
    'color': 'Цвет',
    'power': 'Сила',
    'regions': 'Размер',
    'problems': 'Задачи',
    'solved': 'Решено'
}

let teamKeyFunctions = {
    'id': x => x,
    'name': x => x,
    'color': x => x,
    'power': x => x,
    'regions': x => x,
    'problems': arr => arr.length,
    'solved': function(arr){
        let sum = 0
        arr.forEach((elem) => {sum += elem})
        return sum
    }
}

let teamBannedKeys = ['problems']

class TeamCollection {
    constructor() {
        this.problems = []
        this.teams = []
    }

    setProblems(problems) {
        this.problems = problems
        this.teams.forEach((elem) => {
            elem.problems = problems
            elem.solved = []
            for (let i = 0; i < problems.length; i++){
                elem.solved.push(0)
            }
        })
    }

    getTeamByID(id) {
        let result = undefined
        this.teams.forEach((elem) => {
            if (elem.id == id) result = elem
        })

        return result
    }

    getTeamByName(name) {
        let result = undefined
        this.teams.forEach((elem) => {
            if (elem.name == name) result = elem
        })

        return result
    }

    addTeam(name, color) {
        let newid = this.teams.length > 0 ? this.teams[this.teams.length - 1].id + 1 : 0
        let newteam = new Team(newid)
        newteam.problems = this.problems
        newteam.name = name
        newteam.color = color

        this.teams.push(newteam)

        return newid
    }

    toDOM() {
        let teams = document.createElement('div')
        teams.classList.add(teamsHtmlClass.div)
        let table = document.createElement('table')
        table.classList.add(teamsHtmlClass.table)
        let table_head = document.createElement('tr')

        for (let key in new Team()) {
            if (!teamBannedKeys.includes(key)) {
                let th = document.createElement('th')
                th.classList.add(teamsHtmlClass.th)
                th.innerHTML = teamKeyTranslations[key]
                table_head.appendChild(th)
            }
        }
        table.appendChild(table_head)

        this.teams.forEach((elem) => {
            let tr = document.createElement('tr')
            for (let key in elem) {
                if (!teamBannedKeys.includes(key)) {
                    let td = document.createElement('td')
                    td.classList.add(teamsHtmlClass.td)
                    td.innerHTML = teamKeyFunctions[key](elem[key])
                    if (key == 'color'){
                        td.style.backgroundColor = elem[key]
                        td.style.color = elem[key]
                    }
                    tr.appendChild(td)
                }
            }
            table.appendChild(tr)
        })
        teams.appendChild(table)
        return teams
    }

    problemsToDOM() {
        let teams = document.createElement('div')
        teams.classList.add(teamsHtmlClass.div)
        let table = document.createElement('table')
        table.classList.add(teamsHtmlClass.table)
        let table_head = document.createElement('tr')

        let th = document.createElement('th')
        th.classList.add(teamsHtmlClass.th)
        th.innerHTML = teamKeyTranslations.name
        table_head.appendChild(th)
        for (let key in this.problems) {
            let th = document.createElement('th')
            th.classList.add(teamsHtmlClass.th)
            th.innerHTML = parseInt(key)+1
            table_head.appendChild(th)
        }
        table.appendChild(table_head)

        this.teams.forEach((elem) => {
            let tr = document.createElement('tr')
            let td = document.createElement('td')
            td.classList.add(teamsHtmlClass.td)
            td.innerHTML = elem.name
            tr.appendChild(td)
            for (let i = 0; i < elem.solved.length; i++) {
                let td = document.createElement('td')
                td.classList.add(teamsHtmlClass.td)
                if (elem.solved[i] == 1){
                    td.innerHTML = elem.solved[i]
                    td.style.backgroundColor = "#00aa00"
                }
                else if (elem.solved[i] == -1){
                    td.innerHTML = 0
                    td.style.backgroundColor = "#aa0000"
                }
                else{
                    td.innerHTML = elem.solved[i]
                }
                tr.appendChild(td)
            }
            table.appendChild(tr)
        })
        teams.appendChild(table)
        return teams
    }
}

/*
Polygon: {
    name: int,
    points: [int,int],
    owner: team_id
}
 */
function Polygon(name, points, team = -1) {
    this.name = name
    this.points = points
    this.team = team
}

/*
Label: {
    text: "str",
    x: int,
    y: int
}
 */
function Label(text, x, y) {
    this.text = text
    this.x = x
    this.y = y
}

/*
Map: {
    name: "str",
    image: "uri",
    polygons: [Polygon, Polygon],
    owned_polygons: [index, index, index],
    labels: [Label, Label, Label],
    adjacents: {0: [1,2,3]}
}

Map DOM representation:
.map
    img.map__img[src=MAP->image]
    svg.map__svg
        polygon.map__polygon[data-name=POLYGON->name, data-owner=POLYGON->owner, points=POLYGON->points]
        ...
        text.map__label[x=LABEL->x, y=LABEL->y]{LABEL->text}
 */
let mapHtmlClass = {
    map: 'map',
    img: 'map__img',
    svg: 'map__svg',
    polygon: 'map__polygon',
    polygon_owned: 'polygon_owned',
    text: 'map__text'
}
const mapDefaults = {
    name: "dummy",
    image: "noimage",
    polygons: [new Polygon('0', [1, 2, 3])],
    labels: [new Label('dummy0', 2, 2)],
    adjacents: {}
}

class Map {
    constructor(json) {
        for (let key in mapDefaults) {
            this[key] = json[key]
        }
    }

    getPolygon(polygon_name) {
        let result = undefined
        this.polygons.forEach((poly) => {
            if (poly.name == polygon_name) result = poly
        })
        return result
    }

    getAdjacentsNames(polygon_name) {
        return this.adjacents[polygon_name]
    }

    getOwnedByTeamNames(team_id) {
        let owned = []
        this.polygons.forEach((poly) => {
            if (poly.team == team_id) owned.push(poly.name)
        })

        return owned
    }

    getOwnedNames() {
        let owned = []
        this.polygons.forEach((poly) => {
            if (poly.team != "-1") owned.push(poly.name)
        })

        return owned
    }

    getUnownedNames() {
        let unowned = []
        this.polygons.forEach((poly) => {
            if (poly.team == "-1") unowned.push(poly.name)
        })
        return unowned
    }

    ownPolygon(polygon_name, team_id) {
        let poly = this.getPolygon(polygon_name)
        poly.team = team_id
    }

    toDOM() {
        let map = document.createElement('div')
        map.classList.add(mapHtmlClass.map)
        let img = document.createElement('img')
        img.classList.add(mapHtmlClass.img)
        img.src = this.image
        let svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg')
        svg.classList.add(mapHtmlClass.svg)

        this.polygons.forEach((elem) => {
            let polygon = document.createElementNS("http://www.w3.org/2000/svg", 'polygon')
            polygon.classList.add(mapHtmlClass.polygon)
            polygon.setAttribute('data-name', elem.name)
            polygon.setAttribute('data-team', elem.team)
            polygon.setAttribute('points', elem.points.join(','))

            if (elem.team != -1) polygon.classList.add(mapHtmlClass.polygon_owned)

            svg.append(polygon)
        })

        this.labels.forEach((elem) => {
            let text = document.createElementNS("http://www.w3.org/2000/svg", 'text')
            text.classList.add(mapHtmlClass.text)
            text.setAttribute('x', elem.x)
            text.setAttribute('y', elem.y)
            text.innerHTML = elem.text

            svg.appendChild(text)
        })

        map.appendChild(img)
        map.appendChild(svg)

        return map
    }
}

module.exports = {Map, mapHtmlClass, Team, TeamCollection, Polygon, Label}