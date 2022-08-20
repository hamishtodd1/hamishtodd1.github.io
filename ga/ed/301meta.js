/*
    Points square to -1. Suggests they're rotations. Which, yes
 */

async function init301() {  

    const basisNames = ["", "0", "1", "2", "3", "01", "02", "03", "12", "13", "23", "021", "013", "032", "123", "0123"]

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

    //so you're going to make an array of indices in basisNames
    //and THAT may be converted

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

    //can you use the CGA thing to make sense of the bulk vs weight norm?

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

    const mvToRr = [1, 2, 3, 4, 11, 12, 13, 14]
    const dqToRr = [0, 5, 6, 7, 8, 9, 10, 15]

    function twoChar(n) {
        return n < 10 ? ` ` + n : n
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

                let sign = (reverseSecond ? cayleyTableReverseSigns : cayleyTableSigns)[ai][bi]
                if (sign === 0)
                    return

                let lineIndex = (reverseSecond ? cayleyTableReverse : cayleyTable)[ai][bi]

                muls[lineIndex].push([sign, ai, bi])
            })
        })

        return muls
    }
    function mulsToFullLine(outName, aName, bName, allLineMuls ) {

        let ret = ``

        for (let i = 0; i < 16; ++i) {
            let line = ``

            let lineMuls = allLineMuls[i]
            lineMuls.forEach((mul) => {
                let joiner = ``
                if (line === ``)
                    joiner = mul[0] === 1 ? ` ` : `-`
                else
                    joiner = ` ` + (mul[0] === 1 ? `+` : `-`) + ` `
                line += joiner + aName + `[` + twoChar(mul[1]) + `]*` + bName + `[` + twoChar(mul[2]) + `]`
            })

            ret += `    ` + outName + `[` + twoChar(i) + `] =` + (line === `` ? ` 0.` : line) + `;\n`
        }

        return ret + `\n`
    }

    //instead of [14],[13],[12], want .z,.y,.x
    function generateOptimizedSandwich(granularGradeses) {
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

        let firstMuls = generateGpMuls(coefses, false)

        let cCoefs = Array(16)
        for (let i = 0; i < 16; ++i)
            cCoefs[i] = firstMuls[i].length === 0 ? 0 : 1
        
        let secondCoefses = [cCoefs, coefses[0]]
        let secondMuls = generateGpMuls(secondCoefses, true)

        // whole += `    let c = new Float32Array(16);\n\n`
        // whole += mulsToFullLine(`c`, `a`, `b`, firstMuls)
        // whole += mulsToFullLine(`target`, `c`, `a`, secondMuls)
        // whole += `    delete c;\n`

        
        {
            //ok so you can... 
            //expand out the entire set of lines...
            //look for + and - and eliminate them...
            //collect like terms and introduce some brackets
            //then check what's in brackets across all lines and create them as variables
            //slightly raises the question of what this intermediate thing is
            
            let linesMuls = []
            for(let lineIndex = 0; lineIndex < 16; ++lineIndex ) {
                let lineMuls = []

                //expand out
                for (let i = 0, il = secondMuls[lineIndex].length; i < il; ++i) {

                    let sm = secondMuls[lineIndex][i]
                    let ourFirstMuls = firstMuls[sm[1]]

                    ourFirstMuls.forEach((fm) => {
                        let mul = [sm[0] * fm[0], [fm[1], fm[2], sm[2]]] //it's a, b, a... surely
                        lineMuls.push(mul)

                        //so the line looks like... a[indices0]*b[indices1]*a[indices2]
                    })
                }

                //eliminate identical things
                for (let i = 0; i < lineMuls.length; ++i) {
                    let iMul = lineMuls[i]
                    for (let j = i + 1; j < lineMuls.length; ++j) {
                        let jMul = lineMuls[j]

                        let aIndicesAreTheSame =    (iMul[1][0] === jMul[1][0] && iMul[1][2] === jMul[1][2]) ||
                                                    (iMul[1][0] === jMul[1][2] && iMul[1][2] === jMul[1][0])
                        if (aIndicesAreTheSame &&
                            iMul[0]    !== jMul[0] && //one plus and one minus
                            iMul[1][1] === jMul[1][1] // b index is the same
                            )
                        {
                            lineMuls.splice(j,1)
                            lineMuls.splice(i,1)
                            --i
                            break
                        }
                    }
                }

                linesMuls.push(lineMuls)
            }
            // collect like terms
            let frequencies = []
            for(let i = 0; i < 16; ++i)
                frequencies[i] = new Uint16Array(16)
            linesMuls.forEach((lineMuls)=>{
                lineMuls.forEach((mul)=>{
                    let mis = mul[1]
                    ++frequencies[ mis[0] ][ mis[1] ]
                    ++frequencies[ mis[2] ][ mis[1] ]
                })
            })

            frequencies.forEach((fc,i)=>{
                fc.forEach((f,j)=>{
                    if(f > 1) {
                        // whole += `  let c` + i.toString() + j.toString() + ` = a[`
                    }
                } )
            })
        }
        
        //may also need to do the -1 thing
        
        whole += `    return target;\n}\n`
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