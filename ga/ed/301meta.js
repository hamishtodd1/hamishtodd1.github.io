/*
    Points square to -1. Suggests they're rotations. Which, yes
 */

async function init301() {  

    const basisNames = ["", "0", "1", "2", "3", "01", "02", "03", "12", "13", "23", "021", "013", "032", "123", "0123"]

    let [jsSharedFunctionsString, glslSharedFunctionsString] = createSharedFunctionDeclarationsStrings()
    //newMv is not a variable name. It is equivalent to "new Mv()"

    generalShaderPrefix += glslSharedFunctionsString
    generalShaderPrefix += glsl301

    //javascript part
    {
        let fullFuncString = init301WithoutDeclarations.toString()
        let funcString = fullFuncString
            .slice(0, fullFuncString.indexOf("/*END*/}"))
            .replace("/*EXTRA FUNCTIONS ADDED HERE*/", jsSharedFunctionsString)

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

    //you're going to make an array of indices in basisNames
    //and THAT may be converted

    function putInTables(i,j,index, sign, table, tableSigns) {
        if (index !== -1) {
            table[i][j] = index
            tableSigns[i][j] = sign
        }
    }
    for (let i = 0; i < 16; ++i) {
        mv0.copy(zeroMv)
        mv0[i] = 1.

        //this table is a*b
        cayleyTable[i] = new Uint8Array(16)
        cayleyTableSigns[i] = new Int8Array(16)
        //this table is a*~b
        cayleyTableReverse[i] = new Uint8Array(16)
        cayleyTableReverseSigns[i] = new Int8Array(16)

        for (let j = 0; j < 16; ++j) {
            cayleyTable[i][j] = ZERO_CONTRIBUTION
            cayleyTableReverse[i][j] = ZERO_CONTRIBUTION

            mv1.copy(zeroMv)
            mv1[j] = 1.

            mul(mv0, mv1, mv2)
            putInTables(i, j, mv2.indexOf( 1.), 1, cayleyTable, cayleyTableSigns)
            putInTables(i, j, mv2.indexOf(-1.),-1, cayleyTable, cayleyTableSigns)

            mv1.reverse(mv1)
            mul(mv0, mv1, mv2)
            putInTables(i, j, mv2.indexOf( 1.), 1, cayleyTableReverse, cayleyTableReverseSigns)
            putInTables(i, j, mv2.indexOf(-1.),-1, cayleyTableReverse, cayleyTableReverseSigns)
        }
    }

    const basisNames = [``, `0`, `1`, `2`, `3`, `01`, `02`, `03`, `12`, `31`, `23`, `021`, `013`, `032`, `123`, `0123`]
    log(`cayley table`)
    let spaces = `         `
    for(let i = 0; i < 16; ++i) {
        let row = ``
        for(let j = 0; j < 16; ++j) {
            let entry = cayleyTable[i][j] === ZERO_CONTRIBUTION ? `0` :
                        (cayleyTableSigns[i][j] === 1 ? `` : `-`) +
                        (cayleyTable[i][j] === 0 ? `1` :
                        `e` + basisNames[cayleyTable[i][j]])
            row += spaces.slice(0,7-entry.length) + entry + ` `
        }
        log(row)
    }

    let bladeGgs = {
        Scalar: [1, 0, 0, 0, 0],
        Plane:  [0, 1, 0, 0, 0],
        Line:   [0, 0, 1, 0, 0],
        Point:  [0, 0, 0, 1, 0],
        Pss:    [0, 0, 0, 0, 1],

        Dq: [1, 0, 1, 0, 1],
        Rr: [0, 1, 0, 1, 0],

        Mv: [1, 1, 1, 1, 1]
    }
    //could have quaternions. A higher level of granularity, no e01 etc
    //could have normal vectors. No e123

    class Mul {
        sign = 1.
        aIndex = -1
        bIndex = -1
        xIndex = -1
        constructor(thisSign,thisAIndex, thisBIndex,thisXIndex) {
            this.sign = thisSign
            this.aIndex = thisAIndex
            this.bIndex = thisBIndex
            this.xIndex = thisXIndex
        }
    }

    function generateGpMuls(coefses, reverseSecond) {
        let muls = Array(16)
        for (let i = 0; i < 16; ++i)
            muls[i] = []
            
        coefses[0].forEach((aCoef, ai) => {
            if (aCoef === 0)
                return

            coefses[1].forEach((bCoef, bi) => {
                if (bCoef === 0)
                    return

                let sign =      (reverseSecond ? cayleyTableReverseSigns : cayleyTableSigns)[ai][bi]
                if (sign === 0)
                    return
                let lineIndex = (reverseSecond ? cayleyTableReverse      : cayleyTable     )[ai][bi]

                muls[lineIndex].push(new Mul(sign, ai, bi))
            })
        })

        return muls
    }
    function indexToString(n) {
        return `[` + (n < 10 ? ` ` + n : n) + `]`
    }
    function mulsToString(outName, aName, bName, allLineMuls ) {
        let ret = ``

        for (let i = 0; i < 16; ++i) {
            let line = ``

            let lineMuls = allLineMuls[i]
            lineMuls.forEach((mul) => {
                let joiner = ``
                if (line === ``)
                    joiner = mul.sign === 1 ? ` ` : `-`
                else
                    joiner = ` ` + (mul.sign === 1 ? `+` : `-`) + ` `
                line += joiner + 
                    aName + indexToString(mul.aIndex) + `*` + 
                    bName + indexToString(mul.bIndex) +
                    (mul.xIndex === -1 ? `` : `*` +
                    aName + indexToString(mul.xIndex) )
            })

            ret += line === ``? ``:`    ` + outName + indexToString(i) + ` =` + line + `;\n`
        }

        return ret + `\n`
    }

    //instead of [14],[13],[12], want .z,.y,.x
    function generateOptimizedSandwich(blade1,blade2) {
        let granularGradeses = [bladeGgs[blade1],bladeGgs[blade2]]
        let ret = "function sandwich" + blade1 + blade2 + "(a,b,target) {\n\n"

        let coefses = [Array(16), Array(16)]
        granularGradeses.forEach((granularGrades, i) => {
            let coefs = coefses[i]
            if (granularGrades.length === 5) {
                coefs[0] = granularGrades[0]
                for (let j =  1; j <  5; ++j) coefs[j] = granularGrades[1]
                for (let j =  5; j < 11; ++j) coefs[j] = granularGrades[2]
                for (let j = 11; j < 15; ++j) coefs[j] = granularGrades[3]
                coefs[15] = granularGrades[4]
            }
        })

        let allGradesOdd = true
        granularGradeses.forEach((ggs) => {
            ggs.forEach((gg, i) => {
                if (gg !== 0. && i % 2 === 0)
                    allGradesOdd = false
            })
        })
        if(allGradesOdd)
            log("TODO: result should be multiplied by -1!")

        //at this point, can predict the grades of the output. So, could not bother with this grouping thing...
        //so how do you know that c's plane part will amount to nothing?

        let abMuls = generateGpMuls(coefses, false)

        //c = a*b
        let cCoefs = Array(16)
        for (let i = 0; i < 16; ++i)
            cCoefs[i] = abMuls[i].length === 0 ? 0 : 1
        
        //c = ab
        let abTildeAMuls = generateGpMuls([cCoefs, coefses[0]], true)

        // ret += `    let c = new Float32Array(16);\n\n`
        // ret += mulsToString(`c`, `a`, `b`, abMuls)
        // ret += mulsToString(`target`, `c`, `a`, abTildeAMuls)
        // ret += `    delete c;\n`

        // if(0)
        {
            //How this works:
            //expand out all the muls
            //look for + and - of the same thing and eliminate them (needs to be done for dq,pt!)
            //collect like terms and introduce some brackets
            //then check what's in brackets across all lines and create them as variables

            var lineMulses = []
            for (let lineIndex = 0; lineIndex < 16; ++lineIndex) {
                let lineMuls = []

                //expand out
                for (let i = 0, il = abTildeAMuls[lineIndex].length; i < il; ++i) {

                    // debugger
                    let secondMul = abTildeAMuls[lineIndex][i]
                    let firstMuls = abMuls[secondMul.aIndex] //actually the aTilde index

                    firstMuls.forEach((firstMul) => {
                        let mul = new Mul(secondMul.sign * firstMul.sign, firstMul.aIndex, firstMul.bIndex, secondMul.bIndex)
                        lineMuls.push(mul)
                    })
                }

                //eliminate identical things
                // debugger
                for (let i = 0; i < lineMuls.length; ++i) {
                    let iMul = lineMuls[i]
                    for (let j = i + 1; j < lineMuls.length; ++j) {
                        let jMul = lineMuls[j]

                        let aIndicesAreTheSame = (iMul.aIndex === jMul.aIndex && iMul.xIndex === jMul.xIndex) ||
                                                 (iMul.aIndex === jMul.xIndex && iMul.xIndex === jMul.aIndex)
                        let bIndicesAreTheSame = iMul.bIndex === jMul.bIndex
                        let onePlusAndOneMinus = iMul.sign !== jMul.sign
                        if (aIndicesAreTheSame && bIndicesAreTheSame && onePlusAndOneMinus) {
                            lineMuls.splice(i, 1)
                            lineMuls.splice(j - 1, 1) //j guaranteed to be less than i
                            --i
                            log("eliminated!")
                            break
                        }
                    }
                }

                lineMulses.push(lineMuls)
            }

            // collect like terms
            // ok so this is actually super difficult, there are non-trivial ways to group things (who knew)
            // let frequencies = []
            // for (let i = 0; i < 16; ++i)
            //     frequencies[i] = new Uint16Array(16)
            // lineMulses.forEach((lineMuls) => {
            //     lineMuls.forEach((mul) => {
            //         let mis = mul[1]
            //         ++frequencies[mis[0]][mis[1]]
            //         ++frequencies[mis[2]][mis[1]]
            //     })
            // })

            // frequencies.forEach((fc, i) => {
            //     fc.forEach((f, j) => {
            //         if (f > 1) {
            //             // ret += `  let c` + i.toString() + j.toString() + ` = a[`
            //         }
            //     })
            // })
        }

        ret += `    let c = new Float32Array(16);\n\n`
        // ret += mulsToString(`c`, `a`, `b`, abMuls)
        // ret += mulsToString(`target`, `c`, `a`, abTildeAMuls)
        ret += mulsToString(`target`, `a`, `b`, lineMulses)
        ret += `    delete c;\n`
        
        ret += `    return target;\n}\n`
        log(ret)

        //even if you're using full mvs, this thing has the advantage of avoiding crappy almost-zeroes
    }

    // generateOptimizedSandwich([bladeGgs.Mv, bladeGgs.Mv])
    generateOptimizedSandwich(`Dq`, `Point`)

    //dq, pt
    // generateOptimizedGp([
    //     [1, 0, 1, 0, 1],
    //     [0, 0, 0, 1, 0]] )
}