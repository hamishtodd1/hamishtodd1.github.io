const TAU = Math.PI * 2
const HS3 = Math.sqrt(3) / 2

var frameCount = 0
var frameDelta = 1. / 60.

const log = console.log

const clickables = []
var bindButton = () => { }

const RIGHT_CONTROLLER_INDEX = 0
const LEFT_CONTROLLER_INDEX = 1 - RIGHT_CONTROLLER_INDEX