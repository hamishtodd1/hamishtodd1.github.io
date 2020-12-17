function addMvDeclarations(body, glslInsteadOfJs, num, precedingCharacter) {
    let ret = body
    if (glslInsteadOfJs) {
        for (let i = 0; i < num; ++i)
            ret = `float `+precedingCharacter+`Mv` + i.toString() + `[16];\n`
             + ret
    }
    else {
        for (let i = 0; i < num; ++i)
            ret = `let `+precedingCharacter+`Mv` + i.toString() + ` = new Float32Array(16);\n`
             + ret
             + `\ndelete `+precedingCharacter+`Mv` + i.toString() + `;`
    }

    return ret
}

function initFunctionWithIrs() {

    //ok so you want to have fMv0 used as py

    function irToExecutable(glslInsteadOfJs, f) {
        let body = f.ir + "\nassign(" + f.internalDeclarations[f.internalDeclarations.length-1] + ",target);" 
        // makes more sense than "return", because you deffo want to see the result
        body = addMvDeclarations(body, glslInsteadOfJs, f.maxTmvs, "t")

        if(glslInsteadOfJs) {
            f.internalDeclarations.forEach( (declaredName) => {
                body = `float `+ declaredName + `[16];\n`
                    + body
            })

            //yyyyyyeeeeeeeeeeeeah not so sure about this, you needs uniforms!
            // f.namesWithLocalizationNeeded.forEach((name)=>{
            //     body = `let ` + name + ` = getNameDrawerProperties("` + name + `").value;\n`
            //         + body
            // })
        }
        else {
            f.internalDeclarations.forEach( (declaredName) => {
                body = `let `+ declaredName + ` = new Float32Array(16);\n`
                    + body
                    + `\ndelete `+ declaredName + `;`
            })

            // debugger
            f.namesWithLocalizationNeeded.forEach((name)=>{
                body = `let ` + name + ` = getNameDrawerProperties("` + name + `").value;\n`
                    + body
            })
        }

        let numNonTargetArguments = f.length - 1
        let signature = ""
        if (glslInsteadOfJs) {
            signature += `void ` + f.name + `(`
            for (let i = 0; i < numNonTargetArguments; ++i)
                signature += `in float arg` + i.toString() + `[16],`
            signature += `out float target[16])`
        }
        else {
            signature += `function ` + f.name + `(`
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

        this.maxTmvs = -1,

        this.length = -1
        this.internalDeclarations = []
        this.namesWithLocalizationNeeded = []

        this.name = name
        functionsWithIr[name] = this

        this.functionsWithIrNeeded = []
    }
    FunctionWithIr.prototype.setIr = function (transpilingFunctionProperties) {
        // debugger
        this.stillDefinedInProgram = true

        let tfp = transpilingFunctionProperties
        if (tfp.ir === this.ir)
            return
            
        if(tfp.internalDeclarations.length < 1)
            return
        
        this.internalDeclarations.length = tfp.internalDeclarations.length
        tfp.internalDeclarations.forEach((name,i)=>{
            this.internalDeclarations[i] = name
        })
        // debugger
        this.namesWithLocalizationNeeded.length = tfp.namesWithLocalizationNeeded.length
        tfp.namesWithLocalizationNeeded.forEach((name,i)=>{
            this.namesWithLocalizationNeeded[i] = name
        })
        
        this.length = tfp.arguments.length + 1 // because target

        this.ir = tfp.ir

        this.maxTmvs = tfp.maxTmvs

        this.glslString = irToExecutable(true, this)

        //fairly insane
        // if(this.name === "stereographic")
        //     debugger
        let str = irToExecutable(false, this)
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
                maxTmvs: 0,
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