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
        drawingDetailses[i] = { type:"unassigned" }
    }

    let types = []
    addType = function (typeName,drawers,editingStyle) {
        if(drawers.forEach === undefined )
            drawers = [drawers]
        types[typeName] = {editingStyle,drawers}
    }

    clearNames = function(names) {
        names.forEach((name)=>{
            let index = coloredNamesAlphabetically.indexOf(name)
            Object.keys(drawingDetailses[index]).forEach((key) => {
                if (key === "type")
                    drawingDetailses[index][key] = "unassigned"
                else
                    delete drawingDetailses[index][key]; 
            })
        })
    }
    assignTypeAndData = function (name, type, drawingDetails) {
        let index = coloredNamesAlphabetically.indexOf(name)
        Object.assign(drawingDetailses[index], drawingDetails)
        drawingDetailses[index].type = type
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

            let type = types[drawingDetailses[index].type]
            if ( drawingDetailses[index].type === "unassigned")
                addCharacterToDraw("?", x - characterWidth / 2., y)
            else {
                for(let i = 0; i < type.drawers.length; ++i)
                    type.drawers[i].add(x, y, name)

                if (mouse.inSquare(x, y, .5))
                    mouseDw.placeBasedOnHover(x, y, type.editingStyle, name)
            }
        }
    }
    getNameDrawerProperties = function (name) {
        if (coloredNamesAlphabetically.indexOf(name) === -1)
            return null
        if (drawingDetailses[coloredNamesAlphabetically.indexOf(name)].type === "unassigned")
            return null
        return drawingDetailses[coloredNamesAlphabetically.indexOf(name)]
    }
}