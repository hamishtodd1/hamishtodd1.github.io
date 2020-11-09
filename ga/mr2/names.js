/*
    More generic approach to coloring: stripes are radial spheres. Rotate and it does nothing

    We have alphabeticalNames, which is kinda like memory and never changes after initialization
    and we have orderedNames, which is how things are allocated along the code
        Orderednames can have things taken away from it at random places
        When called upon to make a "new" name, we take the lowest unused thing from alphabeticalNames

    What you want to see is
        Lines of code that output to a certain color stay that way
        But there are many reasons that a line might stop outputting
        Probably inevitable that you're going to be compiling lines only when they're changed
        Could just put the
    Because of function scopes

    For every single line start you have a number. They tell you the order they were created in. They can go high, no reason to reuse them
    And you get name ascriptions to numbers
    Line stops working or gets deleted, that name becomes available (top of the stack)
    Line needs a name, we check if its number has a name already,
        if so ascribe that one
        if not it gets the one at the top of the stack


    SOOOOO
        For all newlines and literals, you know when they were made
        

    you type the color code of the thing, it turns into an index in the background string
*/

function initNamesAndBasis()
{
    let MAX_THINGS = 63 //7 choose 1 + 7 choose 2 + 7 choose 3

    let alphabeticalNames = []
    {
        let idNum = 0
        function generateName() {
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
        while (alphabeticalNames.length < MAX_THINGS) {
            let newName = generateName()
            alphabeticalNames.push(newName)
            namedMvs[newName] = new Float32Array(16)
        }
    }

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
        if(lowestUnusedName === -1)
            console.error("no unused name")

        return lowestUnusedName
    }

    getLowestUnusedName = () => {
        
    }

    let declarationCountSoFar = 0
    let historicalDeclarationCounts = []
    let nameHistoricalDeclarationCounts = {}
    alphabeticalNames.forEach((name) => {
        nameHistoricalDeclarationCounts[name] = -1
    })

    // when you make a new literal or a newline
    if(0) {
        //this is when you make a literal
        //Newline, dunno whether that gets one until runtime! So,
        historicalDeclarationCounts.splice(carat.positionInOrderedNames, 0, declarationCountSoFar)

        //if it's a literal
        // for (let i = 0, il = alphabeticalNames.length; i < il; ++i) {
        //     if (historicalDeclarationCounts[alphabeticalNames[i]] === -1) {
        //         historicalDeclarationCounts[alphabeticalNames[i]] = declarationCountSoFar
        //         break
        //     }
        // }
        ++declarationCountSoFar
    }
    
    //when you delete a literal or newline
    if(0) {
        let declarationCountBeingRemoved = historicalDeclarationCounts.splice(carat.positionInOrderedNames, 1)[0]
        let nameBeingRemoved = keyOf(historicalDeclarationCounts, declarationCountBeingRemoved)
        historicalDeclarationCounts[nameBeingRemoved] = -1
        zeroMv(namedMvs[nameBeingRemoved])
    }

    
    

    
    getDeclarationName = (declarationCountInProgram) => { // either newline or literal. Not all newlines have names and so they don't get ascribed them
        if(frameCount === 0) {
            log("yes, this happens")
            historicalDeclarationCounts.push(declarationCountSoFar)
            ++declarationCountSoFar
        }
        console.assert(declarationCountInProgram < historicalDeclarationCounts.length)

        let historicalDeclarationCount = historicalDeclarationCounts[declarationCountInProgram]
        let name = keyOf(nameHistoricalDeclarationCounts, historicalDeclarationCount) // and give it a name if it lacks one

        return name
    }


    // bindButton("2", () => {
    //     let defaultLineString = "0.,0.,0.,0.,0.,0.,0.,0.,0.,1.,0.,0.,0.,0.,0.,0.,"
    //     addStringAtCarat(defaultLineString)
    //     orderedNames.splice(carat.positionInOrderedNames, 0, getLowestUnusedName() )
    // })
    // bindButton("3", () => {
    //     let defaultPointString = "0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,1.,0.,"
    //     addStringAtCarat(defaultPointString)
    //     orderedNames.splice(carat.positionInOrderedNames, 0, getLowestUnusedName() )
    // })
}