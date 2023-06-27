/*
    Points square to -1. Suggests they're rotations. Which, yes
 */

async function initGa() {

    sinc = (a) => {
        return a == 0. ? 1. : Math.sin(a) / a;
    }

    class GeneralVector extends Float32Array {

        set() {
            return this.copy(arguments)
        }

        multiplyScalar(s) {
            for (let i = 0; i < this.constructor.size; ++i)
                this[i] *= s

            return this
        }

        copy(a) {
            for (let i = 0; i < this.constructor.size; ++i)
                this[i] = a[i]

            return this
        }

        clone() {
            let cl = new this.constructor()
            //also the planes lines and points' magnitude should be on the thingy
            cl.copy(this)

            return cl
        }

        equals(a) {
            let ret = true
            for (let i = 0; i < this.constructor.size; ++i) {
                if (this[i] !== a[i])
                    ret = false
            }
            return ret
        }

        approxEquals(a) {
            let doesEqual = true
            for (let i = 0; i < this.constructor.size; ++i) {
                if (Math.abs(this[i] - a[i]) > .0001)
                    doesEqual = false
            }
            return doesEqual
        }

        fromArray(arr) {
            for (let i = 0; i < this.constructor.size; ++i)
                this[i] = arr[i]

            return this
        }

        toArray(arr) {
            for (let i = 0; i < this.constructor.size; ++i)
                arr[i] = this[i]

            return arr
        }

        fromMv(mv) {
            for (let i = 0; i < this.constructor.size; ++i)
                this[i] = mv[this.constructor.mvOffsets[i]]

            return this
        }

        toMv(target) {
            if (target === undefined)
                target = new Mv()

            target.copy(zeroMv)
            for (let i = 0; i < this.constructor.size; ++i)
                target[this.constructor.mvOffsets[i]] = this[i]

            return target
        }

        add(a, target) {
            if (target === undefined)
                target = new Mv()

            for (let i = 0; i < this.constructor.size; ++i)
                target[i] = this[i] + a[i]
            return target
        }
        sub(a, target) {
            if (target === undefined)
                target = new Mv()

            for (let i = 0; i < this.constructor.size; ++i)
                target[i] = this[i] - a[i]
            return target
        }
    }
    window.GeneralVector = GeneralVector

    function initAlgebra(signature, N_COEFS) {
        let [jsGaString, glslGaString] = createSharedFunctionDeclarationsStrings(N_COEFS)
        //newMv is not a variable name. It is equivalent to "new Mv()"
        // gaShaderPrefix = glslGaString
        // gaShaderPrefix += await getTextFile('shaders/41.glsl') //doesn't exist yet

        //javascript part
        let fullFuncString = eval(`init`+signature+`WithoutDeclarations`).toString()
        let funcString = fullFuncString
            .slice(0, fullFuncString.indexOf("/*END*/}"))
            .replace("/*EXTRA FUNCTIONS ADDED HERE*/", jsGaString)

        let i = 0
        let declarations = ""
        let withoutDeclarations = funcString.replace(/newMv/g, () => {
            declarations += "\n    let newMv" + i + " = new Mv" + (signature === `41` ? `_41` : ``) + "()"
            return "newMv" + (i++)
        })
        var strToEval =
            "(" +
            withoutDeclarations +
            declarations +
            "})()"
        eval(strToEval)
    }

    // initAlgebra(`41`)
    initAlgebra(`301`, 16)
}

function createSharedFunctionDeclarationsStrings(N_COEFS)
{
    let jsGaString = "\n\n"
    let glslGaString = ""

    let jsBodyRegex = new RegExp("/(float\["+N_COEFS+"\])|(float )|(int )/g")
    // let glslBodyRegex = new RegExp("/(\s+=\s+(newMv))|(Math\.)/g")

    //this function takes something written in a weird combination of js and glsl and spits out both
    function createFunction(funcName, funcArgs, body, type) {
        let fillInTarget = type === undefined

        // let glslVersion = (fillInTarget?`void`:type) + " " + funcName + "( "
        let jsVersion = funcName + " = function( "

        funcArgs.forEach((funcArg, i) => {
            if (funcArg.indexOf(" ") === -1) {
                jsVersion += funcArg    
                // glslVersion += "in float["+N_COEFS+"] " + funcArg
            }
            else {
                let splitBySpace = funcArg.split(" ")
                jsVersion += splitBySpace[splitBySpace.length-1]
                // glslVersion += funcArg
            }

            if (i !== funcArgs.length - 1 || fillInTarget) {
                jsVersion += `, `
                // glslVersion += `, `
            }
        })

        let jsBody = body.replace(jsBodyRegex, "let ")
        // let glslBody = body.replace(glslBodyRegex, "")

        if (fillInTarget) {
            // glslVersion += `out float[`+N_COEFS+`] target ) {` + glslBody + `\n}\n`

            jsVersion += `target ) {\n    if(target === undefined)\n        target = new Mv()\n` + 
                jsBody + `\n    return target\n}\n\n`
        }
        else {
            // glslVersion += ` ) {` + glslBody + `\n}\n\n`
            jsVersion += ` ) {` + jsBody + `\n}\n\n`
        }
        
        // glslGaString += glslVersion
        jsGaString += jsVersion
    }

    createVerboseSharedFunctions(createFunction)

    return [ jsGaString, glslGaString ]
}