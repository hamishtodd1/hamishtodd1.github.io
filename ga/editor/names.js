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
        let nameLetters = []
        for(let i = 0; i < name.length; ++i)
            nameLetters.push(name[i])
        nameLetters.sort((a,b)=>a<b?-1:1)

        for (let i = 0; i < MAX_THINGS; i++)
            if (name === orderedNames[i])
                return namedMvs[i]

        return null
    }

    setVector(xUnit, getNamedMv("b").elements)
    setVector(yUnit, getNamedMv("g").elements)
    setVector(zUnit, getNamedMv("o").elements)
    setVector(v1.set(-1., 0., 0.), getNamedMv("p").elements)
    getNamedMv("r").elements[7] = 1.
    getNamedMv("w").elements[4] = 2.5
    let numBuiltInVariables = 6

    //the basis vectors are before the lines
    let lineNames = []
    //ideally none for empty lints
    //you only know at compile time which lines have things on them
    let lineNum = 0
    for(let i = 0; i < backgroundString.length; ++i) {
        if(backgroundString[i] === "\n") {
            lineNames.push(orderedNames[numBuiltInVariables + lineNum])
            ++lineNum
        }
    }
    log(lineNames)

    getMvNamedByLineAtPosition = (yPositioon) => {
        let name = lineNames[Math.floor(-yPositioon)]
        return getNamedMv(name)
    }

    getLineStats = () => {
        let numLines = 1
        let currentCaratLine = -1
        for (let i = 0, il = backgroundString.length; i < il; ++i) {
            if (currentCaratLine === -1 && i === carat.positionInString)
                currentCaratLine = numLines - 1
            if (backgroundString[i] === "\n")
                ++numLines
        }

        return { numLines, currentCaratLine }
    }

    bindButton("Enter", () => {
        let lineStats = getLineStats()

        if (lineStats.numLines >= MAX_THINGS)
            log("too many variables for current system!")
        else {
            addStringAtCarat("\n")

            let lowestUnusedName = -1
            for (let i = 0, il = orderedNames.length; i < il; ++i) {
                let used = false
                for(let j = 0, jl = lineNames.length; j < jl; ++j)
                    if(lineNames[j] === orderedNames[i])
                        used = true
                if(!used) {
                    lowestUnusedName = orderedNames[i]
                    break
                }
            }

            lineNames.splice(lineStats.currentCaratLine+1, 0, lowestUnusedName)

            log(lineNames)
        }
    })
    bindButton("Backspace", () =>
    {
        if (carat.positionInString !== 0) {
            if (backgroundString[carat.positionInString-1] === "\n") {
                lineNames.splice(getLineStats().currentCaratLine, 1)
                log(lineNames)
            }

            backgroundString =
                backgroundString.substring(0, carat.positionInString - 1) + 
                backgroundString.substring(carat.positionInString, backgroundString.length)
            carat.moveAlongString(-1)
        }
    })
    bindButton("Delete", () =>
    {
        if (carat.positionInString < backgroundString.length) {
            if (backgroundString[carat.positionInString] === "\n") {
                lineNames.splice(getLineStats().currentCaratLine, 1)
                log(lineNames)
            }

            //next thing: enormous bug when you use this. try backspace then enter

            backgroundString = 
                backgroundString.substring(0, carat.positionInString) + 
                backgroundString.substring(carat.positionInString + 1, backgroundString.length)
        }
    })
}