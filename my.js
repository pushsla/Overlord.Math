'use strict'

const path = require('path')
global.ROOT = path.resolve(__dirname)
global.my_require = function(module){
    return require(ROOT + "/my_modules/" + module)
}
global.my = require("./my")

