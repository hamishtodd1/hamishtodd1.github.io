/*
    Points square to -1. Suggests they're rotations. Which, yes
 */

async function init41() {

    const basisNames = [
        ``, 
        `1`, `2`, `3`, `+`,`-`,
        `12`, `13`, `1+`, `1-`,    `23`, `2+`, `2-`,   `3+`, `3-`, `+-`,  //line start is [6]
        `123`, `12+`, `12-`, `13+`, `13-`, `23+`, `23-`, `2+-`, `3+-`,  //lines starts at [16]
        `123+`, `123-`, `12+-`, `13+-`, `23+-`,
        `I`]


    let [jsGaString, glslGaString] = createSharedFunctionDeclarationsStrings()
    //newMv is not a variable name. It is equivalent to "new Mv()"

    //javascript part
    {
        let fullFuncString = init41WithoutDeclarations.toString()
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

    basisNames.forEach((bn,i)=>{
        if(i !== 0) {
            let funcName = "e" + bn.replace(`+`, `Plus`).replace(`-`, `Minus`)
            Mv.prototype[funcName] = function () { return this[i] }
        }
    })
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

    return [ jsGaString, glslGaString ]
}