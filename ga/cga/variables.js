const tubeRadius = .035
let spacing = 18
let dwDimension = 170.
const dwColumns = []

function getFov(widthAtOneAway) {
    return Math.atan(widthAtOneAway / 2.) * 2. * (360. / TAU)
}