/*
    More generic approach to coloring: stripes are radial spheres. Rotate and it does nothing
*/

function initNames() {

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

    for(let i = 0; i < NUM_NAMES; ++i) {
        coloredNamesAlphabetically[i] = generateName()
        drawingDetailses[i] = { type:"unassigned" }
    }

    addType = function (typeName,drawers,editingStyle) {
        if(drawers.forEach === undefined )
            drawers = [drawers]
        types[typeName] = {editingStyle,drawers}
    }

    addOneOffPictogramDrawer = function(pictogramDrawer,name) {
        let typeName = "oneOff" + Object.keys(types).length
        addType(typeName, pictogramDrawer, {})
        // let name = getLowestUnusedName()
        assignTypeAndData(name, typeName, {})
        return name
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

    getNameType = (name) => {
        let index = coloredNamesAlphabetically.indexOf(name)
        return drawingDetailses[index].type
    }

    getMvNames = () =>{
        //errrm so this is all of them, not just the ones
        let ret = []
        coloredNamesAlphabetically.forEach((name)=>{
            let dd = drawingDetailses[coloredNamesAlphabetically.indexOf(name)]
            if (dd.type === "mv" && derivedNames.indexOf(name) === -1)
                ret.push(name)
        })
        return ret
    }

    getLowestUnusedName = () => {
        return coloredNamesAlphabetically.find((cna) => getNameDrawerProperties(cna) === null)
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
            if(MODE !== PRESENTATION_MODE){
                addUnnamedFrameToDraw(x, y)
                addCharacterToDraw("?", 0., 0., 0., x - characterWidth / 2., y)
            }
        }
        else {
            if(MODE !== PRESENTATION_MODE)
                addNamedFrameToDraw(x, y, name)

            let type = types[drawingDetailses[index].type]
            if ( drawingDetailses[index].type === "unassigned")
                addCharacterToDraw("?", 0., 0., 0., x - characterWidth / 2., y)
            else {
                for (let i = 0, il = type.drawers.length; i < il; ++i)
                    type.drawers[i].add(name, x, y)

                if (mouse.inSquare(x, y, .5) && MODE !== PRESENTATION_MODE)
                    mouseDw.placeBasedOnHover(x, y, type.editingStyle, name)

                displayWindows.forEach((dw) => {
                    if (dw.collectionY === y && dw.collection.indexOf(name) === -1)
                        dw.collection.push(name)
                })
            }
        }
    }

    //pretty crap
    getNameDrawerProperties = function (name) {
        if (coloredNamesAlphabetically.indexOf(name) !== -1  ) {
            if (drawingDetailses[coloredNamesAlphabetically.indexOf(name)].type !== "unassigned")
                return drawingDetailses[coloredNamesAlphabetically.indexOf(name)]
        }
        else if(suggestionDrawingDetails[name] !== undefined) { //the name is a number
            return suggestionDrawingDetails[name]
        }

        return null
    }
}