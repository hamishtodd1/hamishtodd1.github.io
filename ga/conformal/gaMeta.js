async function initEga() {  

    let [jsSharedFunctionsString, glslSharedFunctionsString] = createSharedFunctionDeclarationsStrings()
    //newEga is not a variable name. It is equivalent to `new Ega()`

    glslEga = glslSharedFunctionsString + glslEga

    //javascript part
    {
        let fullFuncString = initEgaWithoutDeclarations.toString()
        let funcString = fullFuncString
            .slice(0, fullFuncString.indexOf(`/*END*/}`))
            .replace(`/*EXTRA FUNCTIONS ADDED HERE*/`, jsSharedFunctionsString)

        let i = 0
        let declarations = ``

        function thingy(bigStr, str) {
            return bigStr.replaceAll(`new` + str, () => {
                declarations += `\n    let new` + str + i + ` = new ` + str + `()`
                return `new` + str + (i++)
            })
        }
        let withoutDeclarations = thingy( thingy(funcString, `Dq`), `Ega`)

        var strToEval =
            `(` +
            withoutDeclarations +
            declarations +
            `})()`
    }

    eval(strToEval)
}

function createSharedFunctionDeclarationsStrings() {

    let jsGaString = `\n\n`
    let glslGaString = ``

    //this function takes something written in a weird combination of js and glsl and spits out both
    function createFunction(funcName, funcArgs, body, type) {
        let fillInTarget = type === undefined

        let glslVersion = (fillInTarget ? `void` : type) + ` ` + funcName + `( `
        let jsVersion = `function ` + funcName + `( `

        funcArgs.forEach((funcArg, i) => {
            if (funcArg.indexOf(` `) === -1) {
                jsVersion += funcArg    
                glslVersion += `in float[16] ` + funcArg
            }
            else {
                let splitBySpace = funcArg.split(` `)
                jsVersion += splitBySpace[splitBySpace.length-1]
                glslVersion += funcArg
            }

            if (i !== funcArgs.length - 1 || fillInTarget) {
                jsVersion += `, `
                glslVersion += `, `
            }
        })

        let jsBody = body.replace(/(float\[16\])|(float )|(int )/g, `let `)
        let glslBody = body.replace(/(\s+=\s+(newEga))|(Math\.)/g, ``)

        if (fillInTarget) {
            glslVersion += `out float[16] target ) {` + glslBody + `\n}\n`
            //might be nice to check if you are allowed to return an inout

            jsVersion += `target ) {\n    if(target === undefined)\n        target = new Ega()\n` + 
                         jsBody + `\n    return target\n}\n\n`
        }
        else {
            glslVersion += ` ) {` + glslBody + `\n}\n\n`
            jsVersion   += ` ) {` + jsBody   + `\n}\n\n`
        }
        
        glslGaString += glslVersion
        jsGaString += jsVersion
    }

    createVerboseSharedFunctions(createFunction)
    createNonVerboseSharedFunctions(createFunction)

    return [ jsGaString, glslGaString ]
}