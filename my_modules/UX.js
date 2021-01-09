'use strict'

/*
Request: {
    team_id: HTMLselect,
    action: HTMLselect,
    polygon_name: HTMLselect,
    conditions: [needed_value, [[number, solved?], [number, solved?]]]
}

Request DOM representation:
.request
    select.request__teamid>option[value=TEAM->id]{TEAM->name}*AMOUNT_TEAMS
    select.request__action>option[value=OPTIONVALUE]{OPTIONNAME}*AMOUNT_OPTIONS
    select.request__polygon>option[value=POLYGON->name]{POLYGON->name}*AMOUNT_AVAILABLE_POLYGONS
    .request__conditions
        input.request__condition[type=checkbox]
    button.request__button{Вперед!}
 */
let requestHtmlClass = {
    div: "request",
    teamid: "request__teamid",
    action: "request__action",
    polygon_name: "request__polygon",
    conditions: "request__conditions",
    condition: "request__condition",
    condition__problem: "condition__problem",
    condition__solution: "condition__solution",
    button: "request__button"
}

let requestOptions = {
    actions: {
        undefined: "",
        'attack': "Атаковать",
        'own': "Заселить",
        'power': "Укрепиться"
    }
}

let requestConditions = {
    undefined: 0,
    'attack': 2,
    'own': 1,
    'power': 1
}

class Request {
    constructor(teamcollection, map) {
        let self = this

        this.result = {
            team_id: undefined,
            polygon_name: undefined,
            action: undefined,
            conditions: [0,[]]
        }

        this.map = map
        this.teams = teamcollection

        this.div = document.createElement('div')
        this.div.classList.add(requestHtmlClass.div)
        this.team_id = document.createElement('select')
        this.team_id.classList.add(requestHtmlClass.teamid)
        this.action = document.createElement('select')
        this.action.classList.add(requestHtmlClass.action)
        this.polygon__name = document.createElement('select')
        this.polygon__name.classList.add(requestHtmlClass.polygon_name)
        this.conditions = document.createElement('div')
        this.conditions.classList.add(requestHtmlClass.conditions)
        this.button = document.createElement('button')
        this.button.classList.add(requestHtmlClass.button)
        this.button.innerHTML = "Вперед!"

        let option = document.createElement('option')
        option.setAttribute('value', undefined)
        option.innerHTML = ""
        this.team_id.appendChild(option)
        this.teams.teams.forEach((team, index) => {
            let option = document.createElement('option')
            option.setAttribute('value', team.id)
            option.innerHTML = team.name

            self.team_id.appendChild(option)
        })

        for (let key in requestOptions.actions) {
            let option = document.createElement('option')
            option.setAttribute('value', key)
            option.innerHTML = requestOptions.actions[key]

            self.action.appendChild(option)
        }

        this.team_id.onchange = function (event) {
            self.result.team_id = self.team_id.value
            self.refreshPolygonList()
            self.refreshConditions()
        }

        this.action.onchange = function (event) {
            self.result.action = self.action.value
            self.refreshPolygonList()
            self.refreshConditions()
        }

        this.polygon__name.onchange = function(event){
            self.result.polygon_name = self.polygon__name.value
        }

        this.div.appendChild(this.team_id)
        this.div.appendChild(this.action)
        this.div.appendChild(this.polygon__name)
        this.div.appendChild(this.conditions)
        this.div.appendChild(this.button)
    }

    refreshPolygonList() {
        let self = this

        let team = this.team_id.value
        let owned = this.map.getOwnedByTeamNames(team)
        let available = []
        let adjacents = []

        if (owned.length === 0 && self.action.value == 'own') {
            let all = this.map.polygons.filter(x => x.team == -1)
            adjacents = all.map(x => x.name)
        } else {
            owned.forEach((poly) => {
                self.map.getAdjacentsNames(poly).forEach((adj) => {
                    switch (self.action.value) {
                        case "attack":
                            if (self.map.getPolygon(adj).team != -1) adjacents.push(adj)
                            break;
                        case "own":
                            if (self.map.getPolygon(adj).team == -1) adjacents.push(adj)
                            break;
                        case "power":
                            available = []
                            adjacents = []
                            break;
                    }
                })
            })
        }
        available = [...new Set([...available, ...adjacents])]
        available = available.filter(x => !owned.includes(x))

        self.polygon__name.innerHTML = ""
        available.forEach((elem) => {
            let option = document.createElement('option')
            option.setAttribute('value', elem)
            option.innerHTML = elem

            self.polygon__name.appendChild(option)
        })

        this.result.polygon_name = available[0]
    }

    refreshConditions(){
        let self = this

        this.conditions.innerHTML = ""
        let amount = (requestConditions.hasOwnProperty(this.action.value)) ? requestConditions[this.action.value] : 1
        this.result.conditions[0] = amount
        this.result.conditions[1] = []

        let team = this.teams.getTeamByID(this.team_id.value)
        let unsolved_problems = team.problems.filter(x => team.solved[x-1] == 0)

        for (let i = 0; i < amount; i++){
            self.result.conditions[1].push([undefined, false])

            let condition = document.createElement('div')
            condition.classList.add(requestHtmlClass.condition)
            let condition__problem = document.createElement('select')
            condition__problem.classList.add(requestHtmlClass.condition__problem)
            condition__problem.name = "condition"
            condition.appendChild(condition__problem)
            let condition__solution = document.createElement('input')
            condition__solution.type="checkbox"
            condition__solution.classList.add(requestHtmlClass.condition__solution)
            condition__solution.name = "condition"
            condition.appendChild(condition__solution)

            condition__problem.appendChild(document.createElement('option'))
            unsolved_problems.forEach((elem) => {
                let option = document.createElement('option')
                option.value = elem
                option.innerHTML = elem

                condition__problem.appendChild(option)
            })

            condition__problem.onchange = function(event){
                self.result.conditions[1][i][0] = condition__problem.value;
                // let allconditions = Array.prototype.slice.call(self.conditions.children)
                // self.result.conditions[0] = []
                // allconditions.forEach((cond) => {
                //     self.result.conditions.push([])
                //     if (elem.value != ""){
                //         self.result.conditions[0].push(elem.value)
                //     }
                // })
            }

            condition__solution.onchange = function(event){
                self.result.conditions[1][i][1] = condition__solution.checked;
            }

            this.conditions.appendChild(condition)
        }
    }

    toDOM() {
        return this.div
    }
}

module.exports = {Request}