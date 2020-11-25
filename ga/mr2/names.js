/*
    could press "?" to get simplest unused name

    More generic approach to coloring: stripes are radial spheres. Rotate and it does nothing

    New naming system
		you can type any colorString at any time. Still max 3 colors.
		Turns into a pictogram and doesn't turn back. If it's undefined it gets a "?" in there
		colors apply to all the things
		array of names, array of types that those names are, array of the data
		Forget about making them local to a function
*/

function initNames() {

    let NUM_NAMES = coloredNamesAlphabetically.length

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

    let drawingDetailses = Array(NUM_NAMES)
    for(let i = 0; i < NUM_NAMES; ++i) {
        coloredNamesAlphabetically[i] = generateName()
        drawingDetailses[i] = {drawers:[]}
    }

    clearNames = function(names) {
        names.forEach((name)=>{
            let index = coloredNamesAlphabetically.indexOf(name)
            Object.keys(drawingDetailses[index]).forEach((key) => {
                if (key === "drawers")
                    drawingDetailses[index][key].length = 0
                else
                    delete drawingDetailses[index][key]; 
            })
        })
    }
    assignTypeAndData = function (name, drawers, drawingDetails) {
        let index = coloredNamesAlphabetically.indexOf(name)
        Object.assign(drawingDetailses[index], drawingDetails)

        if (drawers.length === undefined)
            drawers = [drawers]
        drawers.forEach((drawer) => {
            drawingDetailses[index].drawers.push(drawer)
        })
    }

    getAlphabetizedColoredName = (str) => {
        if (str.length > 3)
            return null
        let alphabetized = str.split('').sort().join('').toLowerCase() //TODO shouldn't have to do this
        if ( coloredNamesAlphabetically.indexOf(alphabetized) !== -1)
            return alphabetized
        else
            return null
    }

    drawName = function(name,x,y) {
        let index = coloredNamesAlphabetically.indexOf(name)

        if ( index === -1 ) {
            addUnnamedFrameToDraw(x, y)
            addCharacterToDraw("?", x - characterWidth / 2., y)
        }
        else {
            addNamedFrameToDraw(x, y, name)

            if (drawingDetailses[index] === null)
                addCharacterToDraw("?", x - characterWidth / 2., y)
            else {
                let drawers = drawingDetailses[index].drawers
                for(let i = 0; i < drawers.length; ++i)
                    drawers[i].add(x, y, name)
            }
        }
    }
    getNamePropertiesAndReturnNullIfNoDrawers = function (name) {
        if (drawingDetailses[coloredNamesAlphabetically.indexOf(name)].drawers.length === 0)
            return null
        return drawingDetailses[coloredNamesAlphabetically.indexOf(name)]
    }
}