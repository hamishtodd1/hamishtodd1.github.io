/*
    More generic approach to coloring: stripes are radial spheres. Rotate and it does nothing

    We have alphabeticalNames, which is kinda like memory and never changes after initialization
    and we have orderedNames, which is how things are allocated along the code
        Orderednames can have things taken away from it at random places
        When called upon to make a "new" name, we take the lowest unused thing from alphabeticalNames
*/

function initNamesAndBasis(freeVariableCharacters)
{
    let MAX_THINGS = 63 //7 choose 1 + 7 choose 2 + 7 choose 3

    let alphabeticalNames = []
    let idNum = 0
    generateName = () => {
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

        return name
    }
    //for every name there is an mv ready to be used, but we might not use it
    while (alphabeticalNames.length < MAX_THINGS) {
        alphabeticalNames.push(generateName())
        // namedMvs.push(MultivectorAppearance(alphabeticalNames[alphabeticalNames.length-1]))
    }

    getNamedMv = (name) => {
        let nameLettersOrdered = []
        for(let i = 0; i < name.length; ++i)
            nameLettersOrdered.push(name[i])
        nameLettersOrdered.sort((a,b)=>a<b?-1:1)

        for (let i = 0; i < MAX_THINGS; ++i)
            if(nameLettersOrdered.length === alphabeticalNames[i].length) {
                for (let j = 0, jl = nameLettersOrdered.length; j < jl; ++j) {
                    if (nameLettersOrdered[j] !== alphabeticalNames[i][j])
                        break
                    else if(j === jl-1)
                        return namedMvs[i]
                }
            }

        return null
    }

    // backgroundString = 
    //     "[0.; 1.; 0.; 0.; 0.; 0.; 0.; 0.][0.; 0.; 1.; 0.; 0.; 0.; 0.; 0.][0.; 0.; 0.; 1.; 0.; 0.; 0.; 0.]\n"
    //     + "[0.;-1.; 0.; 0.; 0.; 0.; 0.; 0.][0.; 0.; 0.; 0.;2.5; 0.; 0.; 0.][1.; 0.; 0.; 0.; 0.; 0.; 0.; 0.]\n"
    //     + "[.7071; 0.; 0.; 0.;.7071; 0.; 0.; 0.]\n"
    //     + backgroundString

    getLowestUnusedName = () => {
        let lowestUnusedName = -1
        for (let i = 0, il = alphabeticalNames.length; i < il; ++i) {
            let used = false
            for (let j = 0, jl = orderedNames.length; j < jl; ++j)
                if (orderedNames[j] === alphabeticalNames[i])
                    used = true
            if (!used) {
                lowestUnusedName = alphabeticalNames[i]
                break
            }
        }

        return lowestUnusedName
    }

    //ideally none for empty lines
    //you only know at compile time which lines have things on them
    for(let i = 0; i < backgroundString.length; ++i) {
        if( backgroundString[i] === "\n" || 
            freeVariableCharacters.indexOf(backgroundString[i]) !== -1 )
            orderedNames.push(getLowestUnusedName())
    }

    getNumLines = () => {
        let numLines = 1
        for (let i = 0, il = backgroundString.length; i < il; ++i)
            if (backgroundString[i] === "\n")
                ++numLines

        return numLines
    }

    bindButton("Enter", () => {
        let lineStats = getNumLines()

        if (lineStats.numLines >= MAX_THINGS)
            log("too many variables for current system!")
        else {
            addStringAtCarat("\n")
            orderedNames.splice(carat.nextOrderedNameNumber, 0, getLowestUnusedName())
            //the deal is that you might have just broken up a line that makes something into two lines that make something
            //it's the same problem with deleting and backspace
            //we can avoid having to add one here, but then where do you add it?
            //in pad.js, when deciding what color will be in the column, somehow you know from if the carat is at that place?
            //does knowing carat.lineNumber help at all?
            //so ok you have lines that don't have one allocated. Then you allocate one in pad.js when there's something on the line
            //but you have to
        }
    })

    //TODO these should fully remove mvs too. There's really very little reason to see the name after you've made it
    bindButton("Backspace", () => {
        if (carat.positionInString === 0)
            return
        
        let strLength = 1

        if (backgroundString[carat.positionInString - 1] === "\n")
            orderedNames.splice(carat.nextOrderedNameNumber-1, 1)
        else if (backgroundString[carat.positionInString - 1] === "]") {
            let backgroundStringLength = backgroundString.length
            for (strLength; strLength < backgroundStringLength; ++strLength) {
                if (backgroundString[carat.positionInString - strLength] === "[")
                    break
            }
        }

        backgroundString =
            backgroundString.substring(0, carat.positionInString - strLength) +
            backgroundString.substring(carat.positionInString)

        carat.moveAlongString(-strLength)
    })
    bindButton("Delete", () => {
        let backgroundStringLength = backgroundString.length
        if (carat.positionInString === backgroundStringLength-1)
            return

        let strLength = 1

        if (backgroundString[carat.positionInString] === "\n")
            orderedNames.splice(carat.nextOrderedNameNumber, 1)
        else if (backgroundString[carat.positionInString] === "[") {
            let backgroundStringLength = backgroundString.length
            for (strLength; strLength < backgroundStringLength; ++strLength)
                if (backgroundString[carat.positionInString + strLength] === "]") {
                    ++strLength
                    break
                }
        }

        backgroundString =
            backgroundString.substring(0, carat.positionInString) +
            backgroundString.substring(carat.positionInString + strLength)
    })
}