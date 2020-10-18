clamp = (a, min, max) =>{
    if(a < min)
        return min
    else if(max === undefined || a < max)
        return a
    else return max
}

function ScreenPosition()
{
    this.x = 0.
    this.y = 0.
}
ScreenPosition.prototype.copy = function(sp)
{
    this.x = sp.x
    this.y = sp.y
}
ScreenPosition.prototype.set = function (x,y)
{
    this.x = x
    this.y = y
}

function nextPowerOf2(x) {
    return Math.pow(2, Math.ceil(Math.log2(x)))
}

function digitGivenBase(num, base, digitNum) {
    let nearbyIntegerPower = Math.pow(base, digitNum - 1)
    return Math.floor((num % (nearbyIntegerPower * base)) / nearbyIntegerPower)
}