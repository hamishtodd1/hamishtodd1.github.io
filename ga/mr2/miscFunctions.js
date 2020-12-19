function copyStringArray(arr, target) {
    target.length = arr.length
    arr.forEach((str, i) => {
        target[i] = str
    })
}
function unionStringArray(arr, target) {
    arr.forEach((str) => {
        if (target.indexOf(str) === -1)
            target.push(str)
    })
}

function presentJsonFile(string, filename) {
    let data = new Blob([string], { type: 'text/plain' });
    let url = window.URL.createObjectURL(data);

    let download = document.createElement('a');
    download.href = url
    download.setAttribute('download', filename);
    download.style.display = 'none';
    document.body.appendChild(download);
    download.click();
    document.body.removeChild(download);

    window.URL.revokeObjectURL(url)
}

// const freeVariableCharacters = "0123456789.,-e"
// const freeVariableStartCharacters = "0123456789.-"
// function getLiteralLength(literalStart) { //doesn't include "color"
//     let literalLength = 0
//     let numCommasSoFar = 0
//     for (literalLength;
//         literalStart + literalLength < backgroundString.length &&
//         freeVariableCharacters.indexOf(backgroundString[literalStart + literalLength]) !== -1 &&
//         numCommasSoFar < 16;
//         ++literalLength) {
//         if (backgroundString[literalStart + literalLength] === ",")
//             ++numCommasSoFar
//     }

//     return literalLength
// }

keyOf = (obj,thing) => {
    for (propt in obj) {
        if (obj[propt] === thing)
            return propt
    }
    return -1
}

getNumLines = () => {
    let numLines = 1
    for (let i = 0, il = backgroundString.length; i < il; ++i)
        if (backgroundString[i] === "\n")
            ++numLines

    return numLines
}

function lerp(a,b,t) {
    return a + (b-a)*t
}

clamp = (a, min, max) =>{
    if(a < min)
        return min
    else if(max === undefined || a < max)
        return a
    else return max
}

function nextPowerOf2(x) {
    return Math.pow(2, Math.ceil(Math.log2(x)))
}

function digitGivenBase(num, base, digitNum) {
    let nearbyIntegerPower = Math.pow(base, digitNum - 1)
    return Math.floor((num % (nearbyIntegerPower * base)) / nearbyIntegerPower)
}

function nameToHexantColors(name, hexantColors, offset) {
    if (offset === undefined)
        offset = 0
    offset *= 18

    for (let i = 0; i < 6; ++i) {
        let letter = name[Math.floor(i / 6. * name.length)]
        hexantColors[offset + i * 3 + 0] = colors[letter][0]
        hexantColors[offset + i * 3 + 1] = colors[letter][1]
        hexantColors[offset + i * 3 + 2] = colors[letter][2]
    }
    return hexantColors
}

function toGlslFloatLiteral(number) {
    if(number === Math.round(number))
        return number.toString() + "."
    else
        return number.toString()
}