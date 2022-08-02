/*
    Points square to -1. Suggests they're rotations. Which, yes
 */

async function init301() {  

    const basisNames = ["", "0", "1", "2", "3", "01", "02", "03", "12", "31", "23", "021", "013", "032", "123", "0123"]

    let [jsGaString, glslGaString] = createSharedFunctionDeclarationsStrings()
    //newMv is not a variable name. It is equivalent to "new Mv()"

    generalShaderPrefix += glslGaString
    generalShaderPrefix += await getTextFile('shaders/301.glsl')

    //javascript part
    {
        let fullFuncString = init301WithoutDeclarations.toString()
        let funcString = fullFuncString
            .slice(0, fullFuncString.indexOf("/*END*/}"))
            .replace("/*EXTRA FUNCTIONS ADDED HERE*/",jsGaString)

        let i = 0
        let declarations = ""
        let withoutDeclarations = funcString.replace(/newMv/g, () => {
            declarations += "\n    let newMv" + i + " = new Mv()"
            return "newMv" + (i++)
        })
        var strToEval =
            "(" +
            withoutDeclarations +
            declarations +
            "})(basisNames)"
    }

    generateOptimizedSandwiches()
        
    eval(strToEval)
}

function createSharedFunctionDeclarationsStrings()
{
    let jsGaString = "\n\n"
    let glslGaString = ""

    //this function takes something written in a weird combination of js and glsl and spits out both
    function createFunction(funcName, funcArgs, body, type) {
        let fillInTarget = type === undefined

        let glslVersion = (fillInTarget?`void`:type) + " " + funcName + "( "
        let jsVersion = funcName + " = function( "

        funcArgs.forEach((funcArg, i) => {
            if (funcArg.indexOf(" ") === -1) {
                jsVersion += funcArg    
                glslVersion += "in float[16] " + funcArg
            }
            else {
                let splitBySpace = funcArg.split(" ")
                jsVersion += splitBySpace[splitBySpace.length-1]
                glslVersion += funcArg
            }

            if (i !== funcArgs.length - 1 || fillInTarget) {
                jsVersion += `, `
                glslVersion += `, `
            }
        })

        let jsBody = body.replace(/(float\[16\])|(float )|(int )/g, "let ")
        let glslBody = body.replace(/(\s+=\s+(newMv))|(Math\.)/g, "")

        if (fillInTarget) {
            glslVersion += `out float[16] target ) {` + glslBody + `\n}\n`
            //might be nice to check if you are allowed to return an inout

            jsVersion += `target ) {\n    if(target === undefined)\n        target = new Mv()\n` + 
                jsBody + `\n    return target\n}\n\n`
        }
        else {
            glslVersion += ` ) {` + glslBody + `\n}\n\n`
            jsVersion += ` ) {` + jsBody + `\n}\n\n`
        }
        
        glslGaString += glslVersion
        jsGaString += jsVersion
    }

    createVerboseSharedFunctions(createFunction)
    createNonVerboseSharedFunctions(createFunction)

    return [ jsGaString, glslGaString ]
}

function generateOptimizedSandwiches() {
    let cayleyTable = Array(16)
    let cayleyTableSigns = Array(16)
    let cayleyTableReverse = Array(16)
    let cayleyTableReverseSigns = Array(16)
    const ZERO_CONTRIBUTION = 17

    for (let i = 0; i < 16; ++i) {
        cayleyTable[i] = new Uint8Array(16)
        cayleyTableSigns[i] = new Int8Array(16)
        cayleyTableReverse[i] = new Uint8Array(16)
        cayleyTableReverseSigns[i] = new Int8Array(16)
        for (let j = 0; j < 16; ++j) {
            cayleyTable[i][j] = ZERO_CONTRIBUTION
            cayleyTableReverse[i][j] = ZERO_CONTRIBUTION

            mv0.copy(zeroMv)
            mv0[i] = 1.
            mv1.copy(zeroMv)
            mv1[j] = 1.

            mul(mv0, mv1, mv2)
            let indexOfPos1 = mv2.indexOf(1.)
            if (indexOfPos1 !== -1) {
                cayleyTable[i][j] = indexOfPos1
                cayleyTableSigns[i][j] = 1
            }
            let indexOfNeg1 = mv2.indexOf(-1.)
            if (indexOfNeg1 !== -1) {
                cayleyTable[i][j] = indexOfNeg1
                cayleyTableSigns[i][j] = -1
            }

            mv1.reverse(mv1)
            mul(mv0, mv1, mv2)
            indexOfPos1 = mv2.indexOf(1.)
            if (indexOfPos1 !== -1) {
                cayleyTableReverse[i][j] = indexOfPos1
                cayleyTableReverseSigns[i][j] = 1
            }
            indexOfNeg1 = mv2.indexOf(-1.)
            if (indexOfNeg1 !== -1) {
                cayleyTableReverse[i][j] = indexOfNeg1
                cayleyTableReverseSigns[i][j] = -1
            }
        }
    }

    //can you use the CGA thing to make sense of the bulk vs weight norm?

    let bladeGgs = {
        Scalar: [1, 0, 0, 0, 0],
        Plane: [0, 1, 0, 0, 0],
        Line: [0, 0, 1, 0, 0],
        Point: [0, 0, 0, 1, 0],
        Pss: [0, 0, 0, 0, 1],

        Dq: [1, 0, 1, 0, 1],
        Rr: [0, 1, 0, 1, 0],

        Mv: [1, 1, 1, 1, 1]
    }

    const mvToRr = [1, 2, 3, 4, 11, 12, 13, 14]
    const dqToRr = [0, 5, 6, 7, 8, 9, 10, 15]

    function twoChar(n) {
        return n < 10 ? ` ` + n : n
    }
    function generateGpLines(aName, bName, coefses, reverseSecond) {
        let lines = Array(16)
        for (let i = 0; i < 16; ++i)
            lines[i] = ``
        // debugger
        log(coefses)
        coefses[0].forEach((aCoef, ai) => {
            if (aCoef === 0)
                return

            coefses[1].forEach((bCoef, bi) => {
                if (bCoef === 0)
                    return

                let sign = (reverseSecond ? cayleyTableReverseSigns : cayleyTableSigns)[ai][bi]
                if (sign === 0)
                    return

                let lineIndex = (reverseSecond ? cayleyTableReverse : cayleyTable)[ai][bi]

                let joiner = ``
                if (lines[lineIndex] === ``)
                    joiner = sign === 1 ? ` ` : `-`
                else
                    joiner = ` ` + (sign === 1 ? `+` : `-`) + ` `
                lines[lineIndex] += joiner + aName + `[` + twoChar(ai) + `]*` + bName + `[` + twoChar(bi) + `]`
            })
        })

        return lines
    }
    function mulsToFullLine(outName, index, line) {
        return `    ` + outName + `[` + twoChar(index) + `] =` + (line === `` ? ` 0.` : line) + `;\n`
    }

    //instead of [14],[13],[12], want .z,.y,.x
    function generateOptimizedSandwich(granularGradeses) {
        //highest level of granularity: "even" or "odd"
        //third: [0,   0,0,   0,0,   0,0,   0]

        let whole = "function sandwich"
        whole += keyOfProptInObject(granularGradeses[0], bladeGgs)
        whole += keyOfProptInObject(granularGradeses[1], bladeGgs)
        whole += "(a,b,target) {\n\n"

        let coefses = [Array(16), Array(16)]
        granularGradeses.forEach((granularGrades, i) => {
            let coefs = coefses[i]
            if (granularGrades.length === 5) {
                coefs[0] = granularGrades[0]
                for (let j = 1; j < 5; ++j) coefs[j] = granularGrades[1]
                for (let j = 5; j < 11; ++j) coefs[j] = granularGrades[2]
                for (let j = 11; j < 15; ++j) coefs[j] = granularGrades[3]
                coefs[15] = granularGrades[4]
            }
        })

        //at this point, can predict the grades of the output

        let lines = generateGpLines(`a`, `b`, coefses, false)
        //want to identify it

        // let fullMv = false
        // if (!fullMv) 
        {
            let changedLines = Array(16)
            whole += `    let c = new Float32Array(16);\n\n`
            for (let i = 0; i < 16; ++i)
                changedLines[i] = mulsToFullLine(`c`, i, lines[i])
            whole += changedLines.join(``) + `\n`

            let cCoefs = Array(16)
            for (let i = 0; i < 16; ++i)
                cCoefs[i] = lines[i] !== `` ? 1 : 0
            log(cCoefs)
            let secondCoefses = [cCoefs, coefses[0]]

            //can also have a simple "multiplyByMinus1" boolean in this second part

            //coefses are different
            let moreLines = generateGpLines(`c`, `a`, secondCoefses, true)
            moreLines.forEach((moreLine) => {
                //could search for equivalent expressions in the same line
                moreLine
            })
            let moreChangedLines = Array(16)
            for (let i = 0; i < 16; ++i)
                moreChangedLines[i] = mulsToFullLine(`target`, i, moreLines[i])

            whole += moreChangedLines.join(``)
            //we're going to worry about the fullArray->rr changes later
        }
        // else {

        //     let changedLines = Array(8)
        //     whole += `\n    let c = new Float32Array(8);\n\n`

        //     for (let i = 0; i < 8; ++i)
        //         changedLines[i] = mulsToFullLine(`c`, i, lines[mvToRr[i]])
        //     whole += changedLines.join(``)

        //     let moreLines = generateGpLines(`c`, `a`, coefses, true)
        //     for (let i = 0; i < 16; ++i)
        //         changedLines[i] = mulsToFullLine(`target`, i, moreLines[i])
        // }

        whole += `\n    delete c;\n`
        whole += `\n    return target;\n}\n`

        log(whole)

        //even if you're using full mvs, this thing has the advantage of avoiding crappy almost-zeroes
    }

    // generateOptimizedSandwich([bladeGgs.Mv, bladeGgs.Mv])
    generateOptimizedSandwich([bladeGgs.Dq, bladeGgs.Point])

    //dq, pt
    // generateOptimizedGp([
    //     [1, 0, 1, 0, 1],
    //     [0, 0, 0, 1, 0]] )
}