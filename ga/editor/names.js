/*
    no, it's not just about the line number
    Some lines are empty
    Some names are created before you have any lines
    And sometimes you want to make multiple names in one line, especially if you're making a function
    For free parameters, you don't need this "output is on the output column, line has a mouse" thing

    Sure, if a line has some stuff on it, evaluate that line
    And if you have a function, that uses output column too

    so essentially whenever there's anything between \n and \n
*/

function initNamesAndBasis()
{
    let MAX_THINGS = 63 //7 choose 1 + 7 choose 2 + 7 choose 3

    let orderedNames = []
    let idNum = 0
    generateName = () =>
    {
        ++idNum

        let digitNum = 0
        let correctlyBasedNumberString = ""
        let digit = Infinity

        while (true)
        {
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
        // log("str: ", correctlyBasedNumberString, " name: ", name)

        return name
    }
    //for every name there is an mv ready to be used, but we might not use it
    while (orderedNames.length < MAX_THINGS) {
        orderedNames.push(generateName())
        namedMvs.push(MultivectorAppearance(orderedNames[orderedNames.length-1]))
    }

    getNamedMv = (name) => {
        let nameLettersOrdered = []
        for(let i = 0; i < name.length; ++i)
            nameLettersOrdered.push(name[i])
        nameLettersOrdered.sort((a,b)=>a<b?-1:1)

        for (let i = 0; i < MAX_THINGS; ++i)
            if(nameLettersOrdered.length === orderedNames[i].length) {
                for (let j = 0, jl = nameLettersOrdered.length; j < jl; ++j) {
                    if (nameLettersOrdered[j] !== orderedNames[i][j])
                        break
                    else if(j === jl-1)
                        return namedMvs[i]
                }
            }

        return null
    }

    setVector(xUnit, getNamedMv("b").elements)
    setVector(yUnit, getNamedMv("g").elements)
    setVector(zUnit, getNamedMv("o").elements)
    setVector(v1.set(-1., 0., 0.), getNamedMv("p").elements)
    getNamedMv("r").elements[7] = 1.
    getNamedMv("w").elements[4] = 2.5
    let numBuiltInVariables = 6

    //could build in the above too
    // let literalNames = []
    // for(let i = 0; i < backgroundString.length; ++i) {
    //     if(backgroundString[i] === "[") {
    //         literalNames.push(orderedNames[numBuiltInVariables])
    //         ++numBuiltInVariables
    //     }
    // }

    //the basis vectors are before the lines
    lineNames = []
    //ideally none for empty lints
    //you only know at compile time which lines have things on them
    let lineNum = 0
    for(let i = 0; i < backgroundString.length; ++i) {
        if(backgroundString[i] === "\n") {
            lineNames.push(orderedNames[numBuiltInVariables + lineNum])
            ++lineNum
        }
    }

    getMvNamedByLineAtPosition = (yPositioon) => {
        let name = lineNames[Math.floor(-yPositioon)]
        return getNamedMv(name)
    }

    getNumLines = () => {
        let numLines = 1
        for (let i = 0, il = backgroundString.length; i < il; ++i)
            if (backgroundString[i] === "\n")
                ++numLines

        return numLines
    }

    makeNewLineAtCaratPosition = () => {
        addStringAtCarat("\n")

        let lowestUnusedName = -1
        for (let i = numBuiltInVariables, il = orderedNames.length; i < il; ++i)
        {
            let used = false
            for (let j = 0, jl = lineNames.length; j < jl; ++j)
                if (lineNames[j] === orderedNames[i])
                    used = true
            if (!used)
            {
                lowestUnusedName = orderedNames[i]
                break
            }
        }

        lineNames.splice(carat.lineNumber + 1, 0, lowestUnusedName)
    }

    bindButton("Enter", () => {
        let lineStats = getNumLines()

        if (lineStats.numLines >= MAX_THINGS)
            log("too many variables for current system!")
        else {
            makeNewLineAtCaratPosition()
        }
    })
    bindButton("Backspace", () => {
        if (backgroundString[carat.positionInString-1] === "]") {
            let arrayStrLength = 2
            for (arrayStrLength, lengthl = backgroundString.length; arrayStrLength < lengthl; ++arrayStrLength) {
                if (backgroundString[carat.positionInString - arrayStrLength] === "[")
                    break
            }

            backgroundString =
                backgroundString.substring(0, carat.positionInString - arrayStrLength) +
                backgroundString.substring(carat.positionInString)
            
            carat.moveAlongString(-arrayStrLength)
        }
        else if (carat.positionInString !== 0) {
            if (backgroundString[carat.positionInString-1] === "\n")
                lineNames.splice(carat.lineNumber, 1)

            backgroundString =
                backgroundString.substring(0, carat.positionInString - 1) + 
                backgroundString.substring(carat.positionInString)

            carat.moveAlongString(-1)
        }
    })
    bindButton("Delete", () => {
        if(backgroundString[carat.positionInString] === "["){
            let arrayStrLength = 1
            for(arrayStrLength, lengthl = backgroundString.length; arrayStrLength < lengthl; ++arrayStrLength)
                if(backgroundString[carat.positionInString+arrayStrLength] === "]") {
                    ++arrayStrLength
                    break
                }

            backgroundString =
                backgroundString.substring(0, carat.positionInString) +
                backgroundString.substring(carat.positionInString + arrayStrLength)
        }
        else {
            if (backgroundString[carat.positionInString] === "\n")
                lineNames.splice(carat.lineNumber+1, 1)

            backgroundString = 
                backgroundString.substring(0, carat.positionInString) + 
                backgroundString.substring(carat.positionInString + 1)
        }
    })
}