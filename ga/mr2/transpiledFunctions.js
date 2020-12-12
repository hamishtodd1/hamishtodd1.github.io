function addMvDeclarations(body, glslInsteadOfJs, num, precedingCharacter) {
    let ret = body
    if (glslInsteadOfJs) {
        for (let i = 0; i < num; ++i)
            ret = `float `+precedingCharacter+`Mv` + i.toString() + `[16];\n` + ret
    }
    else {
        for (let i = 0; i < num; ++i)
            ret = `let `+precedingCharacter+`Mv` + i.toString() + ` = new Float32Array(16);\n` + ret + `\ndelete `+precedingCharacter+`Mv` + i.toString() + `;`
    }

    return ret
}

function initFunctionWithIrs() {

    function irToExecutable(glslInsteadOfJs, functionName) {
        let f = functionsWithIr[functionName]

        let body = f.ir + "\nassign(fMv" + (f.numDeclarations-1).toString() + ",target);" 
        // makes more sense than "return", because you deffo want to see the result
        body = addMvDeclarations(body, glslInsteadOfJs, f.numDeclarations, "f")

        let numNonTargetArguments = f.length - 1
        let signature = ""
        if (glslInsteadOfJs) {
            signature += `void ` + functionName + `(`
            for (let i = 0; i < numNonTargetArguments; ++i)
                signature += `in float arg` + i.toString() + `[16],`
            signature += `out float target[16])`
        }
        else {
            signature += `function ` + functionName + `(`
            for (let i = 0; i < numNonTargetArguments; ++i)
                signature += `arg` + i.toString() + `,`
            signature += `target)`
        }

        return signature + 
            "\n{\n" +
                body +
            "\n}"
    }

    FunctionWithIr = function(name) {
        this.ir = "UNUSED"
        this.stillDefinedInProgram = true
        this.glslString = ""
        this.jsFunction = null

        this.length = -1
        this.numDeclarations = -1

        this.name = name
        functionsWithIr[name] = this

        this.functionsWithIrNeeded = []
    }
    FunctionWithIr.prototype.setIr = function (transpilingFunctionProperties) {
        this.stillDefinedInProgram = true

        let tfp = transpilingFunctionProperties
        if (tfp.ir === this.ir)
            return
            
        if(tfp.numDeclarations < 1)
            return

        log(transpilingFunctionProperties)
        
        this.numDeclarations = tfp.numDeclarations
        this.length = tfp.arguments.length + 1 // because target

        this.ir = tfp.ir

        this.glslString = irToExecutable(true, this.name)

        //fairly insane
        let str = irToExecutable(false, this.name)
        // debugger
        eval(str)
        this.jsFunction = eval(this.name)

        //and rewrite the stuff it gets used in?
        //the shaders should know where they're getting it from
    }

    new FunctionWithIr("reflectHorizontally")
    let updateAlternatingFunction = () => {
        // if (Math.floor(frameCount / 50) % 2)
        //     functionsWithIr["reflectHorizontally"].setIr(1,0,`assign(arg0,target);`)
        // else 
        {
            functionsWithIr["reflectHorizontally"].setIr({
                numDeclarations: 3,
                arguments: ["input"],
                ir: 
                `
            plane(fMv0,1.,0.,0.,0.);

            gProduct(fMv0,arg0,fMv1);
            gProduct(fMv1,fMv0,fMv2);
            `
            })
        }

        // `
        // assign(pointOnGlobe,outputMv);
        // outputMv[12] -= .09;
        // `
        // `
        // point(outputMv,
        // 	lon * cos(lat) * .3,
        // 	lat * .3,
        // 	0.,1.);
        // `
    }
    // updateFunctions.splice(0, 0, updateAlternatingFunction)
    updateAlternatingFunction()
}