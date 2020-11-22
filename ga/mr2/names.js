/*
    More generic approach to coloring: stripes are radial spheres. Rotate and it does nothing

    New naming system
		you can type any colorString at any time. Still max 3 colors.
		Turns into a pictogram and doesn't turn back. If it's undefined it gets a "?" in there
		colors apply to all the things
		array of names, array of types that those names are, array of the data
		Forget about making them local to a function
*/

function initNames() {

    let NUM_NAMES = 63 //7 choose 1 + 7 choose 2 + 7 choose 3

    let idNum = 0
    generateName = () => {
        ++idNum

        let digitNum = 0
        let correctlyBasedNumberString = ""
        let digit = Infinity

        while (true) {
            ++digitNum
            let newDigit = digitGivenBase(idNum, colorCharacters.length + 1, digitNum)
            //you could figure out what to add to idNum such that you get a valid thing next
            if (newDigit === 0 || newDigit >= digit)
                return generateName()

            digit = newDigit
            correctlyBasedNumberString = digit + correctlyBasedNumberString

            if (Math.pow(colorCharacters.length + 1, digitNum) > idNum) //-1?
                break
        }
        let name = ""
        for (let i = 0; i < correctlyBasedNumberString.length; i++)
            name += correctlyBasedNumberString[i] === "0" ? "" : colorCharacters[correctlyBasedNumberString[i] - 1]

        return name
    }
    //for every name there is an mv ready to be used, but we might not use it
    while (coloredNamesAlphabetically.length < NUM_NAMES)
        coloredNamesAlphabetically.push(generateName())

    let pictogramDrawers = Array(NUM_NAMES)
    let properties = Array(NUM_NAMES)

    isName = function(str) {
        if(str.length > 3)
            return false
        let alphabetized = str.split('').sort().join('').toLowerCase() //TODO shouldn't have to do this
        return coloredNamesAlphabetically.indexOf(alphabetized) !== -1
    }

    assignNameToPictogram = function(name,drawer,drawingDetails) {
        let index = coloredNamesAlphabetically.indexOf(name)
        pictogramDrawers[index] = drawer
        properties[index] = drawingDetails
    }
    drawName = function(name,x,y) {
        let index = coloredNamesAlphabetically.indexOf(name)
        pictogramDrawers[index].add(x,y,name)
    }
    getNameProperties = function (name) {
        return properties[coloredNamesAlphabetically.indexOf(name)]
    }
}