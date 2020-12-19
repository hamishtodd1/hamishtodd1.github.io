function addMvDeclarations(body,glslInsteadOfJs, numTmvs, namesWithLocalizationNeeded, internalDeclarations) {
    if (glslInsteadOfJs) {

        for (let i = 0; i < numTmvs; ++i)
            body = `float tMv` + i.toString() + `[16];\n`
                + body

        if (internalDeclarations !== undefined) {
            internalDeclarations.forEach((declaredName) => {
                body = `float ` + declaredName + `[16];\n`
                    + body
            })
        }

        //for namesWithLocalizationNeeded, you needs uniforms! Yeesh, could send everything in
    }
    else {
        (Object.keys(functionsWithIr)).forEach((name) => {
            body = "let " + name + " = functionsWithIr." + name + ".jsFunction;\n"
                + body
        })

        for (let i = 0; i < numTmvs; ++i)
            body = `let tMv` + i.toString() + ` = new Float32Array(16);\n`
                + body
                + `\ndelete tMv` + i.toString() + `;`


        namesWithLocalizationNeeded.forEach((name) => {
            body = `let ` + name + ` = getNameDrawerProperties("` + name + `").value;\n`
                + body
        })

        if (internalDeclarations !== undefined) {
            internalDeclarations.forEach((declaredName) => {
                body = `let ` + declaredName + ` = new Float32Array(16);\n`
                    + body
                    + `\ndelete ` + declaredName + `;`
            })
        }
    }

    return body
}

function initFunctionWithIrs() {

    //ok so you want to have fMv0 used as py

    function irToFunction(glslInsteadOfJs, f) {

        let finalAssignment = f.internalDeclarations.length !== 0 ? 
            "\nassign(" + f.internalDeclarations[f.internalDeclarations.length - 1] + ",target);" :
            "\nzeroMv(target);"

        let body = f.ir + finalAssignment
        //using the last declared variable makes more sense than "return", because you deffo want to see the result
        // if(f.name === "stereographic" &&glslInsteadOfJs === false)
        //     debugger
        body = addMvDeclarations(body, glslInsteadOfJs, f.maxTmvs, f.namesWithLocalizationNeeded, f.internalDeclarations)

        let numNonTargetArguments = f.argumentsInSignature.length
        let signature = ""
        if (glslInsteadOfJs) {
            signature += `void ` + f.name + `(`
            for (let i = 0; i < numNonTargetArguments; ++i)
                signature += `in float ` + f.argumentsInSignature[i] + `[16],` //altenratively, the actual names
            signature += `out float target[16])`
        }
        else {
            signature += `function ` + f.name + `(`
            for (let i = 0; i < numNonTargetArguments; ++i)
                signature += f.argumentsInSignature[i] + `,`
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

        this.maxTmvs = -1,

        this.length = -1
        this.internalDeclarations = []
        this.namesWithLocalizationNeeded = []
        this.argumentsInSignature = []

        this.name = name
        functionsWithIr[name] = this
    }
    FunctionWithIr.prototype.setIr = function (transpilingFunctionProperties) {
        // debugger
        this.stillDefinedInProgram = true

        let tfp = transpilingFunctionProperties
        if (tfp.ir === this.ir)
            return
            
        if(tfp.internalDeclarations.length < 1)
            return
        
        copyStringArray(tfp.internalDeclarations, this.internalDeclarations)
        copyStringArray(tfp.namesWithLocalizationNeeded, this.namesWithLocalizationNeeded)
        copyStringArray(tfp.argumentsInSignature, this.argumentsInSignature)
        
        this.length = tfp.argumentsInSignature.length + 1 // because target. Urgh, fairly dumb name

        this.ir = tfp.ir

        this.maxTmvs = tfp.maxTmvs

        this.glslString = irToFunction(true, this)

        //fairly insane
        // debugger
        let str = irToFunction(false, this)
        eval(str)
        this.jsFunction = eval(this.name)

        //and rewrite the stuff it gets used in?
        //the shaders should know where they're getting it from

        //for more aribtrary types defined in the editor, you could compile the function into a string containing stuff like "gl.uniform1f" and so on
    }

    new FunctionWithIr("reflectHorizontally")
    let updateAlternatingFunction = () => {
        // if (Math.floor(frameCount / 50) % 2)
        //     functionsWithIr["reflectHorizontally"].setIr(1,0,`assign(arg0,target);`)
        // else 
        {
            functionsWithIr["reflectHorizontally"].setIr({
                internalDeclarations: ["fMv0","fMv1","fMv2"],
                namesWithLocalizationNeeded:[],
                argumentsInSignature: ["ourInput"],
                maxTmvs: 0,
                ir: 
                `
            plane(fMv0,1.,0.,0.,0.);

            gProduct(fMv0,ourInput,fMv1);
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